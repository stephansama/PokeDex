// DOM Elements
const imgs = document.querySelectorAll('#pkimage')
const names = document.querySelectorAll('#pkname')
const buttons = document.querySelectorAll('.carousel');

let audio = new Audio('/static/sounds/click.mp3');
// local variables
let selected = 0
let time = 200
let init = false
let globalLinks = []

// EVENT Listeners
buttons.forEach(button=>{
    button.addEventListener('click', e =>{
        const offset = button.className.includes('next') ? 1 : -1
        changeClass(updateSelected(offset))
    })
})


// allow for using the keyboard
document.onkeydown = (k) => {
    if(k.code === 'ArrowDown'){ 
        changeClass(updateSelected(1))
    } else if(k.code === 'ArrowUp') {
        changeClass(updateSelected(-1))
    } else if(k.code === 'Enter') {
        visitLink()
    }
}

function addLink(list){
    globalLinks.push(list)
}

function visitLink(){
    let t = 0
    imgs.forEach((img, idx) => {
        if(img.className === 'show') {
            t = idx
        }
    })
    t = parseInt(t)
    console.log(t)
    console.log(globalLinks[t])
    window.location.href = globalLinks[t]
}

function updateSelected(offset) {
    selected += offset
    if(selected < 0) selected = imgs.length - 1
    if(selected >= imgs.length) selected = 0
    return selected
}

// Functions
function changeClass(sel) {
    imgs.forEach((img, idx) => {
        let value = idx === sel ? 'show' : ''
        imgs[idx].className = value
        names[idx].className = value
        if(names[idx].className === 'show'){names[idx].scrollIntoView()}
    })
    audio.play()
    setTimeout(() =>{
        audio.pause()
    }, time)
}

function changeSelectClass(sel) {
    selected = sel
    changeClass(updateSelected(0))
}

changeClass(0)