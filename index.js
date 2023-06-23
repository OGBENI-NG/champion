import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const endorsementsTxt = document.getElementById("text-el")
const fromEl = document.getElementById("from")
const toEl = document.getElementById("to")
const formEl = document.getElementById("form-el")
const endorsementsContainer = document.getElementById("endorsements-container")

const appSettings = {
  databaseURL: "https://champion-6a054-default-rtdb.firebaseio.com/"
}
//setting up firebase
const app = initializeApp(appSettings)
const database = getDatabase(app)
const dataInDatabase = ref(database, "champion")
const heartIcon = "/assets/heart.png"
const heartIconPurple = "/assets/heart-purple.png"

formEl.addEventListener("submit", (e) => {
    e.preventDefault()
    const textAreaValue = endorsementsTxt.value
    const fromValue = fromEl.value
    const toValue = toEl.value
    // pushing all input values to firebase as abject
    push(dataInDatabase, {
        textareaValue: textAreaValue,
        fromValue: fromValue,
        toValue: toValue,
        likeCount: 7,
        likeId: Date.now().toString()
    })
    clearInputsFields()
})
//creating endorsements field from innerHTML
function createEndorsementHTML(endorsement) {
    const { toValue, textareaValue, fromValue, likeCount, isLiked, likeId } = endorsement
    const heartImgSrc = isLiked ? heartIconPurple : heartIcon

    return `
        <div class="endorsements-html">
        <h3>To ${toValue}</h3>
        <p>${textareaValue}</p>
        <div class="from-container">
            <h3>From ${fromValue}</h3>
            <div class="heart-container" id="toggle-like-${likeId}">
            <img src="${heartImgSrc}" alt="heart-icon" class="heart">
            <span id="count-like-${likeId}" ${isLiked ? 'class="liked"' : ""}>${likeCount}</span>
            </div>
        </div>
        </div>
    `
}

function renderEndorsements(endorsements) {
    const endorsementsHtml = endorsements.map(createEndorsementHTML).join("")
    endorsementsContainer.innerHTML = endorsementsHtml
}

function likeEndorsements(likeId) {
    const countLikeElement = document.getElementById(`count-like-${likeId}`)
    const countLikeValue = parseInt(countLikeElement.textContent)

    const isLiked = countLikeElement.classList.contains("liked")
    const newLikeCount = isLiked ? countLikeValue - 1 : countLikeValue + 1

    countLikeElement.textContent = newLikeCount

    const endorsementRef = ref(database, `champion/${likeId}`)
    update(endorsementRef, {
        likeCount: newLikeCount,
        isLiked: !isLiked
    })
}

endorsementsContainer.addEventListener("click", (event) => {
    const target = event.target

    if (target.classList.contains("heart-container") || target.closest(".heart")) {
        const heartContainer = target.closest(".heart-container")
        const likeId = heartContainer.id.replace("toggle-like-", "")
        likeEndorsements(likeId)
    }
})

onValue(dataInDatabase, (snapshot) => {
    const endorsements = []
    snapshot.forEach((childSnapshot) => {
        const itemInDatabase = childSnapshot.val()
        const likeId = childSnapshot.key
        itemInDatabase.likeId = likeId
        endorsements.unshift(itemInDatabase)
    })

    renderEndorsements(endorsements)
})

function clearInputsFields() {
    endorsementsTxt.value = ""
    fromEl.value = ""
    toEl.value = ""
}
