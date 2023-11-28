async function loadWorks() {
    await getWorks();
}

async function getWorks() {
    const request = await fetch("http://localhost:5678/api/works");
    const response = await request.text();
    const jsonResp = JSON.parse(response);
    for (const k of jsonResp) {
        document.querySelector(".gallery").appendChild(createFigure(k["title"], k["imageUrl"]))
        await new Promise(r => setTimeout(r, 100));
        document.querySelector(".gallery figure:last-child").style.opacity = "1";
    }
}

async function getInstantWorks() {
    const request = await fetch("http://localhost:5678/api/works");
    const response = await request.text();
    const jsonResp = JSON.parse(response);
    const arr = {};
    for (const k of jsonResp) {
        arr[k["id"]] = k["imageUrl"];
    }
    return arr;
}


function createFigure(name, imgUrl, opacity = 0) {
    let fig = document.createElement("figure");
    let figImg = document.createElement("img");
    let figCaption = document.createElement("figcaption");

    figImg.setAttribute("src", imgUrl);
    figImg.setAttribute("alt", name);

    figCaption.textContent = name;

    fig.appendChild(figImg);
    fig.appendChild(figCaption);
    fig.style.opacity = opacity.toString();
    fig.style.transitionDuration = "0.2s";

    return fig;
}

async function filterFigures(categoryID) {
    const galleryChildren = document.querySelector(".gallery").children;
    const works = await fetch("http://localhost:5678/api/works")
        .then(response => response.text())
        .then((json) => JSON.parse(json));
    let figureID = 0;
    for (let workID in works) {
        if (categoryID !== 0 && works[workID]['categoryId'] !== categoryID) {
            galleryChildren[figureID].style.display = "none"
            console.log(works[workID]);
        } else {
            galleryChildren[figureID].style.display = "block"
        }
        figureID++;
    }
    console.log(works)
}

async function addWork() {
    const imageInput = document.getElementsByClassName("input")[0].children[0];
    const image = imageInput.files[0];
    const title = document.getElementById("title").value;
    const categories = document.getElementById("cat").value;
    const data = new FormData();

    data.append('image', image);
    data.append("title", title);
    data.append("category", ["O", "A", "H"].indexOf(categories[0]) + 1);

    const token = document.cookie.replace("token=", "");

    const request = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            'Authorization': 'Bearer ' + token,
        },
        body: data,
    });

    const response = await request.json();
    console.log(response);

    document.getElementsByClassName("diag-works")[0].innerHTML = ""
    console.log(request.statusCode)
    const works = await getInstantWorks();

    const imageUrl = works[Object.keys(works)[Object.keys(works).length - 1]];

    document.getElementsByClassName("gallery")[0].appendChild(createFigure(title, imageUrl, 1));
    document.getElementsByTagName("dialog")[0].close();
}

async function deleteWork(workID, dialogID) {
    console.log(workID, dialogID)
    const request = await fetch("http://localhost:5678/api/works/" + workID, {
        method: "DELETE",
        headers: {
            'Accept': '*/*',
            'Authorization': "Bearer " + document.cookie.replace("token=", "")
        },
    });
    document.getElementsByClassName("diag-works")[0].children[dialogID].innerHTML = ""
    await showArticles();
    document.getElementsByClassName("gallery")[0].children[dialogID].remove();
    document.getElementsByTagName("dialog")[0].close();
}
