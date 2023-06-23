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

  push(dataInDatabase, {
    textareaValue: textAreaValue,
    fromValue: fromValue,
    toValue: toValue,
    likeCount: 5,
    likeId: Date.now().toString()
  })
  clearInputsFields()
})

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
    let endorsementsContainerHtml = []
    snapshot.forEach((childSnapshot) => {
      const itemInDatabase = childSnapshot.val()
      const likeId = childSnapshot.key
  
      const likeCount = itemInDatabase.likeCount || 0
      const isLiked = itemInDatabase.isLiked || false
  
      const heartImgSrc = isLiked ? heartIconPurple : heartIcon
  
      endorsementsContainerHtml.unshift(`
        <div class="endorsements-html">
          <h3>To ${itemInDatabase.toValue}</h3>
          <p>${itemInDatabase.textareaValue}</p>
          <div class="from-container">
            <h3>From ${itemInDatabase.fromValue}</h3>
            <div class="heart-container" id="toggle-like-${likeId}">
              <img src="${heartImgSrc}" alt="heart-icon" class="heart">
              <span id="count-like-${likeId}" ${isLiked ? 'class="liked"' : ""}>${likeCount}</span>
            </div>
          </div>
        </div>
      `)
    })
  
    endorsementsContainerHtml = endorsementsContainerHtml.join("")
    endorsementsContainer.innerHTML = endorsementsContainerHtml
})
  

function clearInputsFields() {
  endorsementsTxt.value = ""
  fromEl.value = ""
  toEl.value = ""
}
