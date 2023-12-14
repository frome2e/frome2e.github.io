import MckD from "./assets/mckdjs/MckD.js";

let cards = null;
let filters = null;
const hambugers = document.querySelectorAll(".hamburger");
const toggleMenus = document.querySelectorAll(".toggle-nav");
const searchFeed = document.querySelector("#search-feed");
const filtersWrapper = document.querySelector("#filters-wrapper");
const contentJsonUrl = "src/content/content.json";
const previewImgsUrl = "src/content/previews/";
const feed = document.querySelector("#feed");
const landingPage = document.querySelector("#landing-page");
const contentPage = document.querySelector("#content-page");
const closePage = document.querySelector("#closePage");
const MckDrenderer = new MckD({"element": "#page"});

async function fetchPage(src) {
    let content = (await fetch(src)).text();
    return content;
}

async function showPage(src) {
    const pageSrc = "./src/content/content/" + src;
    landingPage.classList.add("hid");
    contentPage.classList.remove("hid");
    const mardownText = await fetchPage(pageSrc);
    
    // const newUrl = `${src.replace(".md", "")}`;
    // history.replaceState({page: 2}, src.replace(".md", ""), newUrl);
    MckDrenderer.render(mardownText);
}

const fetchContent = () => {
    return new Promise((resolve, reject) => {
        fetch("src/content/content.json")
        .then((response) => {
            if (!response.ok) {
                throw("Network response was not okay");
            }
            return response.json();
        })
        .then((data) => {resolve(data)})
        .catch((error) => {
            console.error(`There was an error fetching content.json`, error);
            reject(error);
        })
    })
}

function loadContent() {
    function addToFeed(data) {
        const tags = data.rating + "," + data.tags + "," + data.compatibility;
        const compatibility = data.compatibility.split(",");
        let compatibilities = "";
        compatibility.forEach((compatibilit) => {
            compatibilities += `<li>${compatibilit}<li>`;
        })
        const card = document.createElement("template");
        card.innerHTML =
        `
            <li class="fw cardwrapper" data-title="${data.title.toLowerCase()}" data-tags="${tags}">
                <a draggable="false" data-url="${data.url}" target="_blank" class="card cont fw flex col" >
                    <ul class="fw rnd overflwh row al-cntr sqr hscrlb scbg scrlh scrlsnpx">
                        <li class="flex jst-cntr al-cntr mhfh mwfw ovrflwh">
                            <img draggable="false" src="${previewImgsUrl + data.img}" alt="${data.title}" class="mhfh">
                        </li>
                        <li class="flex cont jst-cntr al-cntr mhfh mwfw ovrflwh">
                            <p class="mhfh mwhw bdb">${data.description}</p>
                        </li>
                    </ul>
                    <div class="col sg">
                        <h3>${data.title}</h3>
                        <p class="sbc">${data.date}</p>
                        <ul class="row sg">${compatibilities}</ul>
                    </div>
                </a>
            </li>
        `
        feed.appendChild(card.content);
    }

    let content = [];

    function loopData() {
        content.sort((a, b) => b.rating - a.rating);
        for (let i = 0; i < content.length; i++) {
            addToFeed(content[i]);
        }
        cardOnclick();
    }

    fetchContent()
    .then((data) => {content = data; loopData(); getTags();})
    .catch((error) => { console.error("Error:", error)})

    function cardOnclick() {
        const cards = document.querySelectorAll(".card");
        cards.forEach((card) => {
            card.onclick = () => {
                showPage(card.dataset.url);
            }
        })
    }
}

function createFilterBtn(tag) {
    const list = document.createElement("li");
    list.classList.add("mw");
    const btn = document.createElement("button");
    btn.innerHTML = tag;
    btn.classList.add("fw");
    btn.dataset.filter = tag;
    list.appendChild(btn);

    filtersWrapper.appendChild(list);
    if (tag == "all") {
            btn.onclick = () => {
                cards.forEach((card) => {
                card.classList.remove("hid");
            })
        }
    } else {
        btn.onclick = () => {
            cards.forEach((card) => {
                const tags = card.dataset.tags.split(",");
                if (tags.includes(tag)) {
                    card.classList.remove("hid");
                } else {
                    card.classList.add("hid");
                }
            })
    }
}
}

function getTags() {
    cards = document.querySelectorAll("[data-tags]")
    const tags = ["pc","mobile","code"];
    cards.forEach((card) => {
        const cardTags = card.dataset.tags.split(",");
        cardTags.forEach((tag) => {
            if (!tags.includes(tag)) {
                tags.push(tag);
            }
        })
    })
    createFilterBtn("all")
    tags.forEach((tag) => {
        createFilterBtn(tag);
    })
}

searchFeed.oninput = () => {
    if (searchFeed.value == "") {
        cards.forEach((card) => {
            card.classList.remove("hid");
        })
    } else {
        cards.forEach((card) => {
            const cardName = card.dataset.title;

            if (searchFeed.value.length <= cardName.length) {
                const splitCardName = cardName.substring(0, searchFeed.value.length);
                if (splitCardName === searchFeed.value.toLowerCase()) {
                    card.classList.remove("hid");
                } else {
                    card.classList.add("hid");
                }
            }
        })
    }
}

closePage.onclick = () => {
    // history.replaceState({page: 1}, "from e2e", "");

    landingPage.classList.remove("hid");
    contentPage.classList.add("hid");
}

window.onload = () => {
    hambugers.forEach((hambuger) => {
        hambuger.onclick = () => {
            toggleMenus.forEach((menu) => {
                menu.classList.toggle("hid");
            })
        }
    })
    loadContent();
}