function generateLorem(length){
    let temp = "lorem ipsum\n", ret = ""
    for(let i = 0; i < length;++i)
        ret += temp;
    return ret;
}

document.getElementById("smaller").innerText = generateLorem(500)