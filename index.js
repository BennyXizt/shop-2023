const COOKIE_EXPIRES_DAYS = 1 * 24 * 60 * 60 * 1000;
// d h m s ms
const COOKIE_EXPIRES_MINUTES = 1 * 1 * 1 * 60 * 1000;
document.addEventListener("DOMContentLoaded", function () {
    const PATH = "http://localhost:3000";
    let c = new Controller(PATH);
    document.addEventListener("click", function (e) {
        const buttonAddToBacket = e.target.closest(".products__item-add");
        const buttonBacket = e.target.closest(".header__navigate-link--basket");
        const buttonWindow = e.target.closest(".window__hidden");
        const buttonRemoveFromBacket = e.target.closest(".window__item-button--remove-product");
        const buttonCreateProduct = e.target.closest(".window__item-button--add-product");
        const buttonAddNewProduct = e.target.closest(".header__navigate-link--product");
        const buttonToRegisterForm = e.target.closest(".authorise__item-label--link-signup");
        const buttonToLoginForm = e.target.closest(".authorise__item-label--link-signin");
        const buttonAuthentification = e.target.closest(".authorise__item-button");
        const buttonAuthentificationLogout = e.target.closest(".header__navigate-link--logout");
        const buttonPagination = e.target.closest(".products__pagination-item");
        if (buttonAddToBacket)
            c.addToBacket(buttonAddToBacket);
        if (buttonBacket)
            c.showBacket(e);
        if (buttonWindow)
            c.closeWindow();
        if (buttonRemoveFromBacket)
            c.removeFromBacket(buttonRemoveFromBacket);
        if (buttonAddNewProduct)
            c.addNewProduct(e);
        if (buttonCreateProduct)
            c.buttonCreateProduct();
        if (buttonToRegisterForm)
            c.registerForm(e);
        if (buttonToLoginForm)
            c.loginForm(e);
        if (buttonAuthentification)
            c.authentification(e, buttonAuthentification);
        if (buttonAuthentificationLogout)
            c.authentificationLogout(e);
        if (buttonPagination)
            c.showPagination(buttonPagination);
    });
    console.log(`Cookie: ${document.cookie}`);
    if (!document.cookie.includes("authorised=")) {
        const div = document.querySelector(".authorise");
        div.style.display = "block";
        return;
    }
    else {
        const div = document.querySelector(".authorise");
        const nav = document.querySelector(".header__navigate-list");
        const child = document.createElement("li");
        child.innerHTML = `
    <a href="" class="header__navigate-link header__navigate-link--logout">
      <span class="header__navigate-image">
        <img src="./img/logout.svg" alt="" class="header__navigate-icon">
      </span>
      <span class="header__navigate-text">Logout</span>
    </a>
    `;
        child.classList.add("header__navigate-item");
        nav.appendChild(child);
        div.style.display = "none";
    }
    fetch(PATH)
        .then((res) => res.json())
        .then((data) => {
        console.log("Data");
        console.log(data.users);
        c.init(data);
        c.loadData();
    });
    if (document.cookie.includes("backet=")) {
        const backet = document.querySelector(".header__navigate-image");
        const div = document.createElement("div");
        div.classList.add("header__navigate-counter");
        const startIndex = document.cookie.indexOf("backet=") + 7;
        const endIndex = document.cookie.lastIndexOf("}") + 1;
        const count = document.cookie
            .slice(startIndex, endIndex)
            .split("|")
            .filter((e) => e != "").length;
        if (count == 0) {
            div.remove();
        }
        else {
            div.setAttribute("data-label", count.toString());
            backet.appendChild(div);
        }
    }
});
class Controller {
    constructor(path) {
        this.window = new ModalWindow();
        this.path = path;
        this.startedPagination = 0;
        this.endedPagination = 0;
    }
    showPagination(e) {
        const items = document.querySelector(".products__list");
        const paginationElement = document.querySelector(".products__pagination");
        items.innerHTML = "";
        const filterBy = document.querySelector(".products__article-select--type").selectedOptions[0].value;
        const pagination = document.querySelector(".products__article-select--pagination").selectedOptions[0].value;
        let data = this.data.products.filter((e) => {
            if (filterBy == "All Products")
                return e;
            else
                return e.brand == filterBy;
        });
        console.log(`Products per page: ${pagination}, all products: ${data.length}`);
        if (pagination != "All Products") {
            const paginatedTotal = Math.round(data.length / parseInt(pagination));
            const paginationCounter = parseInt(e.innerText) % 3;
            console.log(`Total Paginated: ${paginatedTotal}`);
            this.endedPagination = parseInt(e.innerText) * parseInt(pagination);
            this.startedPagination = this.endedPagination - parseInt(pagination);
            console.log(`Pagination -- Start: ${this.startedPagination} End: ${this.endedPagination}`);
            paginationElement.innerHTML = "";
            for (let i = 0; i < paginatedTotal; i++) {
                paginationElement.innerHTML +=
                    `
          <div class='products__pagination-item'>${i + 1}</div>
        `;
            }
            data = data.slice(this.startedPagination, this.endedPagination);
        }
        data.map((e) => {
            items.innerHTML += `
          <div class='products__item'>
            <img class='products__item-icon' src='./img/${e.brand}.png'>
            <b class='products__item-label'>${e.brand + " " + e.model}</b>
            <span class='products__item-price'>${e.price}</span>
            <div class='products__item-buttons'>
              <button class='products__item-add'>Add to Backet</button>
            </div>
          </div>
          `;
        });
    }
    authentificationLogout(e) {
        e.preventDefault();
        const cookie = document.cookie
            .split(" ")
            .find((e) => !e.startsWith("authorised"));
        document.cookie =
            "authorised=; Max-Age=0; path=/; domain=" + location.hostname + "\n";
        // document.cookie += cookie
        location.reload();
    }
    authentification(e, curr) {
        e.preventDefault();
        const type = curr.parentNode.parentNode.querySelector(".authorise__subtitle").innerHTML;
        const login = curr.parentElement.parentElement.querySelector(".authorise__item-input--login").value;
        const pass = curr.parentElement.parentElement.querySelector(".authorise__item-input--password").value;
        if (type == "Authorise") {
            console.log("System: Trying to authorise");
            fetch(`${this.path}/users`)
                .then((res) => res.json())
                .then((data) => {
                console.log(data.users);
                const foundData = data.users.find((e) => e.login == login && e.password == pass);
                if (foundData) {
                    const d = new Date();
                    d.setTime(d.getTime() + COOKIE_EXPIRES_MINUTES);
                    let expires = "expires=" + d.toUTCString();
                    const cookieAdditionalText = document.cookie
                        .split(" ")
                        .find((e) => !e.startsWith("authorised"));
                    console.log("System: User found!");
                    document.cookie = `authorised=true;${expires};path=/`;
                    // document.cookie = `authorised=true;${expires};path=/`
                    // console.log(`Not authentificated Cookie: ${cookieAdditionalText}`);
                    // return
                    // document.cookie = "authorised=true;" + expires + ";path=/";
                    // document.cookie += cookie
                    location.reload();
                }
            });
        }
        else {
            fetch(`${this.path}/users/add`, {
                method: "POST",
                body: JSON.stringify({
                    login: login,
                    password: pass,
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }).then((data) => {
                console.log(data);
            });
        }
    }
    registerForm(e) {
        e.preventDefault();
        const currForm = document.querySelector(".authorise__wrapper--signin");
        const nextForm = document.querySelector(".authorise__wrapper--signup");
        Object.assign(currForm.style, {
            top: "1800px",
        });
        Object.assign(nextForm.style, {
            top: "0px",
        });
    }
    loginForm(e) {
        e.preventDefault();
        const currForm = document.querySelector(".authorise__wrapper--signup");
        const nextForm = document.querySelector(".authorise__wrapper--signin");
        Object.assign(currForm.style, {
            top: "1800px",
        });
        Object.assign(nextForm.style, {
            top: "0px",
        });
    }
    whiteCookie() {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
    closeWindow() {
        const body = document.querySelector("body");
        body.classList.toggle("active");
        this.window.closeWindow();
    }
    buttonCreateProduct() {
        const brand = document.querySelector(".window__item-select--brand").selectedOptions[0].innerHTML;
        const color = document.querySelector(".window__item-select--color").selectedOptions[0].innerHTML;
        const model = document.querySelector(".window__item-input--model").value;
        const price = document.querySelector(".window__item-input--price").value;
        fetch(`${this.path}/product/add`, {
            method: "POST",
            body: JSON.stringify({
                brand: brand,
                model: model,
                colour: color,
                price: parseInt(price),
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        }).then((data) => {
            console.log(data);
        });
    }
    addNewProduct(e) {
        e.preventDefault();
        this.window.showAddNewProductWindow();
    }
    showBacket(e) {
        e.preventDefault();
        const isBacketNotEmpty = document.cookie.split(" ").find((e) => e.startsWith("backet")).length > 8;
        if (isBacketNotEmpty) {
            const body = document.querySelector("body");
            body.classList.toggle("active");
            this.window.showBacketWindow();
        }
    }
    removeFromBacket(e) {
        if (!document.cookie.includes("backet="))
            return;
        let text = e.parentElement.querySelector(".window__item-label").innerHTML;
        const foundElement = this.data.products.find((e) => e.brand + " " + e.model == text);
        console.log(`Removed Element: ${JSON.stringify(foundElement)}`);
        let startIndexBacket = document.cookie.indexOf("backet=") + 7;
        let endIndexBacket = document.cookie.slice(startIndexBacket).lastIndexOf("}") + 1;
        let backetCookie = document.cookie.slice(startIndexBacket, startIndexBacket + endIndexBacket);
        const startIndexUser = document.cookie.indexOf("authorised=");
        const endIndexUser = document.cookie
            .slice(startIndexUser)
            .indexOf(";");
        const userCookie = document.cookie.slice(startIndexUser, startIndexUser + endIndexUser);
        backetCookie = backetCookie
            .split("|")
            .filter((e) => e != JSON.stringify(foundElement))
            .join("|");
        const d = new Date();
        d.setTime(d.getTime() + COOKIE_EXPIRES_MINUTES);
        let expires = "expires=" + d.toUTCString();
        document.cookie =
            "backet=" + backetCookie + ";" + expires + ";path=/" + "\n";
        document.cookie += userCookie + ";" + expires + ";path=/";
        const backet = document.querySelector(".header__navigate-image");
        startIndexBacket = document.cookie.indexOf("backet=") + 7;
        endIndexBacket =
            document.cookie.slice(startIndexBacket).lastIndexOf("}") + 1;
        let div = document.querySelector(".header__navigate-counter");
        const count = document.cookie
            .slice(startIndexBacket, endIndexBacket)
            .split("|")
            .filter((e) => e != "").length;
        if (count == 0) {
            div.remove();
        }
        else {
            div.setAttribute("data-label", count);
            backet.appendChild(div);
        }
        text = "";
        const cookie = backetCookie
            .split("|")
            .filter((e) => e != "")
            .map((e) => JSON.parse(e));
        for (let i = 0; i < cookie.length; i++) {
            text += `
            <div class='window__item'>
              <span class='window__item-label'>${cookie[i].brand} ${cookie[i].model}</span>
              <button class='window__item-button window__item-button--remove-product'>X</button>
            </div>
          `;
        }
        const window = document.querySelector(".window");
        window.innerHTML =
            `
          <div class='window__container'>
            <div class='window__title'>Backet</div>
            <div class='window__body'>
        ` +
                text +
                `
            </div>
          </div>
          <div class='window__hidden'></div>
        `;
    }
    addToBacket(elem) {
        const child = elem.parentElement.parentElement;
        const text = child.querySelector(".products__item-label").innerHTML;
        const foundElement = this.data.products.find((e) => e.brand + " " + e.model == text);
        console.log(`Phone: ${text}`);
        console.log(`Found: ${JSON.stringify(foundElement)}`);
        if (document.cookie.includes("backet=")) {
            const startIndexBacket = document.cookie.indexOf("backet=") + 7;
            const endIndexBacket = document.cookie.slice(startIndexBacket).lastIndexOf("}") + 1;
            let backetCookie = document.cookie.slice(startIndexBacket, startIndexBacket + endIndexBacket);
            const isProducNotExists = backetCookie.indexOf(JSON.stringify(foundElement)) == -1;
            const startIndexUser = document.cookie.indexOf("authorised=");
            const endIndexUser = document.cookie
                .slice(startIndexUser)
                .indexOf(";");
            const userCookie = document.cookie.slice(startIndexUser, startIndexUser + endIndexUser);
            console.log(document.cookie);
            if (backetCookie === "") {
                const d = new Date();
                d.setTime(d.getTime() + COOKIE_EXPIRES_MINUTES);
                let expires = "expires=" + d.toUTCString();
                document.cookie =
                    "backet=" +
                        JSON.stringify(foundElement) +
                        ";" +
                        expires +
                        ";path=/" +
                        "\n";
                // document.cookie += userCookie + ";" + expires + ";path=/";
            }
            else if (isProducNotExists) {
                const d = new Date();
                d.setTime(d.getTime() + COOKIE_EXPIRES_MINUTES);
                let expires = "expires=" + d.toUTCString();
                backetCookie += "|" + JSON.stringify(foundElement);
                document.cookie =
                    "backet=" + backetCookie + ";" + expires + ";path=/" + "\n";
                // document.cookie += userCookie + ";" + expires + ";path=/";
            }
        }
        else {
            const cookie = document.cookie
                .split(" ")
                .find((e) => e.startsWith("authorised"));
            const d = new Date();
            d.setTime(d.getTime() + COOKIE_EXPIRES_MINUTES);
            let expires = "expires=" + d.toUTCString();
            document.cookie =
                "backet=" +
                    JSON.stringify(foundElement) +
                    ";" +
                    expires +
                    ";path=/" +
                    "\n";
            // document.cookie += cookie
        }
        const backet = document.querySelector(".header__navigate-image");
        let div = document.querySelector(".header__navigate-counter");
        if (document.body.contains(div)) {
            div = document.querySelector(".header__navigate-counter");
            div.innerText = "";
        }
        else {
            div = document.createElement("div");
            div.classList.add("header__navigate-counter");
        }
        const startIndex = document.cookie.indexOf("backet=") + 7;
        const endIndex = document.cookie.lastIndexOf("}") + 1;
        const count = document.cookie
            .slice(startIndex, endIndex)
            .split("|")
            .filter((e) => e != "").length;
        div.setAttribute("data-label", count);
        backet.appendChild(div);
    }
    init(data) {
        this.data = data;
    }
    loadData() {
        const ref = this;
        const product = document.querySelector(".products__container");
        const article = document.createElement("article");
        article.classList.add("products__article");
        const selectType = document.createElement("select");
        selectType.classList.add("products__article-select", "products__article-select--type");
        const selectPagination = document.createElement("select");
        selectPagination.classList.add("products__article-select", "products__article-select--pagination");
        const listFilterByBrands = [
            ...new Set(this.data.products.map((e) => e.brand)),
        ];
        const listProductsPagination = [6, 30, 100, 250];
        selectType.innerHTML += `<option class='products__select-option'>All Products</option>`;
        selectPagination.innerHTML += `<option class='products__select-option'>All Products</option>`;
        for (let i = 0; i < listFilterByBrands.length; i++) {
            selectType.innerHTML += `<option class='products__select-option'>${listFilterByBrands[i]}</option>`;
        }
        for (let i = 0; i < listProductsPagination.length; i++) {
            selectPagination.innerHTML += `<option class='products__select-option'>${listProductsPagination[i]}</option>`;
        }
        selectType.addEventListener("change", function (e) {
            let filterBy = e.target.value;
            ref.filterData(filterBy);
        });
        selectPagination.addEventListener("change", function (e) {
            let paginated = e.target.value;
            ref.paginatedData(paginated);
        });
        const items = document.createElement("div");
        items.classList.add("products__list");
        console.log(this.data.products);
        this.data.products.map((e) => {
            items.innerHTML += `
            <div class='products__item'>
              <img class='products__item-icon' src='./img/${e.brand}.png'>
              <b class='products__item-label'>${e.brand + " " + e.model}</b>
              <span class='products__item-price'>${e.price}</span>
              <div class='products__item-buttons'>
                <button class='products__item-add'>Add to Backet</button>
              </div>
            </div>
            `;
        });
        const labelType = document.createElement("label");
        labelType.classList.add("products__select-label");
        labelType.innerText = "Filter By:";
        const labelPagination = document.createElement("label");
        labelPagination.classList.add("products__select-label");
        labelPagination.innerText = "Products per Page:";
        const pagination = document.createElement("div");
        pagination.classList.add("products__pagination");
        pagination.innerHTML = `<div class='products__pagination-item'>1</div>`;
        article.appendChild(labelType);
        article.appendChild(selectType);
        article.appendChild(labelPagination);
        article.appendChild(selectPagination);
        product.appendChild(article);
        product.appendChild(items);
        product.appendChild(pagination);
    }
    paginatedData(pagination) {
        const items = document.querySelector(".products__list");
        const paginationElement = document.querySelector(".products__pagination");
        items.innerHTML = "";
        const filterBy = document.querySelector(".products__article-select--type").selectedOptions[0].value;
        let data = this.data.products.filter((e) => {
            if (filterBy == "All Products")
                return e;
            else
                return e.brand == filterBy;
        });
        console.log(`Products per page: ${pagination}, all products: ${data.length}`);
        if (pagination != "All Products") {
            const paginatedTotal = Math.round(data.length / parseInt(pagination));
            console.log(`Total PAginated: ${paginatedTotal}`);
            paginationElement.innerHTML = "";
            for (let i = 0; i < paginatedTotal; i++) {
                paginationElement.innerHTML +=
                    `
          <div class='products__pagination-item'>${i + 1}</div>
        `;
            }
            data = data.slice(0, parseInt(pagination));
        }
        data.map((e) => {
            items.innerHTML += `
          <div class='products__item'>
            <img class='products__item-icon' src='./img/${e.brand}.png'>
            <b class='products__item-label'>${e.brand + " " + e.model}</b>
            <span class='products__item-price'>${e.price}</span>
            <div class='products__item-buttons'>
              <button class='products__item-add'>Add to Backet</button>
            </div>
          </div>
          `;
        });
    }
    filterData(filterBy) {
        const items = document.querySelector(".products__list");
        const paginationElement = document.querySelector(".products__pagination");
        const pagination = document.querySelector(".products__article-select--pagination").selectedOptions[0].value;
        items.innerHTML = "";
        let data = this.data.products.filter((e) => {
            if (filterBy == "All Products")
                return e;
            else
                return e.brand == filterBy;
        });
        console.log(`Products per page: ${pagination}, all products: ${data.length}`);
        if (pagination != "All Products") {
            const paginatedTotal = Math.round(data.length / parseInt(pagination));
            console.log(`Total PAginated: ${paginatedTotal}`);
            paginationElement.innerHTML = "";
            for (let i = 0; i < paginatedTotal; i++) {
                paginationElement.innerHTML +=
                    `
          <div class='products__pagination-item'>${i + 1}</div>
        `;
            }
            data = data.slice(0, parseInt(pagination));
        }
        data.map((e) => {
            items.innerHTML += `
            <div class='products__item'>
              <img class='products__item-icon' src='./img/${e.brand}.png'>
              <b class='products__item-label'>${e.brand + " " + e.model}</b>
              <span class='products__item-price'>${e.price}</span>
              <div class='products__item-buttons'>
                <button class='products__item-add'>Add to Backet</button>
              </div>
            </div>
            `;
        });
    }
}
class ModalWindow {
    constructor() { }
    showAddNewProductWindow() {
        const element = document.querySelector(".wrapper");
        const window = document.createElement("section");
        window.classList.add("window");
        window.innerHTML = `
          <div class='window__container'>
            <div class='window__title'>Add New Product</div>
            <div class='window__body'>
              <div class='window__item'>
                    <span>Выберите бренд: </span>
                    <select class='window__item-select window__item-select--brand'>
                      <option>Apple</option>
                      <option>Samsung</option>
                    </select>
              </div>
              <div class='window__item'>
                    <span>Выберите модель: </span>
                    <input class='window__item-input window__item-input--model' type='text' >
              </div>
              <div class='window__item'>
                    <span>Выберите цвет: </span>
                    <select class='window__item-select window__item-select--color'>
                      <option>Red</option>
                      <option>Blue</option>
                      <option>Green</option>
                      <option>Orange</option>
                    </select>
              </div>
              <div class='window__item'>
                    <span>Введите цену: </span>
                    <input class='window__item-input window__item-input--price' type='text' >
              </div>
              <div class='window__item'>
                <button class='window__item-button window__item-button--add-product'>Добавить продукт</button>
              </div>
            </div>
          </div>
          <div class='window__hidden'></div>
        `;
        element.appendChild(window);
    }
    closeWindow() {
        const element = document.querySelector(".window");
        element.remove();
    }
    showBacketWindow() {
        //   document.cookie = 'backet=; Max-Age=0; path=/; domain=' + location.hostname;
        const startIndex = document.cookie.indexOf("backet=") + 7;
        const endIndex = document.cookie.lastIndexOf("}") + 1;
        const cookie = document.cookie
            .slice(startIndex, endIndex)
            .split("|")
            .map((e) => JSON.parse(e));
        if (cookie == void [])
            return;
        let text = "";
        for (let i = 0; i < cookie.length; i++) {
            text += `
            <div class='window__item'>
              <span class='window__item-label'>${cookie[i].brand} ${cookie[i].model}</span>
              <button class='window__item-button window__item-button--remove-product'>X</button>
            </div>
          `;
        }
        const element = document.querySelector(".wrapper");
        const window = document.createElement("section");
        window.classList.add("window");
        window.innerHTML =
            `
          <div class='window__container'>
            <div class='window__title'>Backet</div>
            <div class='window__body'>
        ` +
                text +
                `
            </div>
          </div>
          <div class='window__hidden'></div>
        `;
        element.appendChild(window);
    }
}
