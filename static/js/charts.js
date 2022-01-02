// Stephan Randle
// 12/25/21
// Graph Helper Functions
//------------------------------------------
const COLORS = ['#FF0000','#CC0000','#3B4CCA','#3d7dca','#FFDE00','#B3A125']

function genNext(last){
    let next = COLORS[Math.floor(Math.random() * COLORS.length - 1)]
    if(next === last) next = genNext(last)
    return next
}

function randomizeColors(Length) {
    let random = [], last = COLORS[0]
    for(let i = 0; i < COLORS.length; i++) {
        random.push(last = genNext(last))
    }
    console.log(random)
    return random
}

function createChart(argObj, title='Pokémon Information', id='pokechart'){
    const ctx = document.getElementById(id).getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(argObj),
            datasets: [{
                label: title,
                data: Object.keys(argObj).map(key => argObj[key]),
                backgroundColor: randomizeColors(argObj.length),
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                title:{
                    display: true,
                    color:'rgba(0,0,0,1)',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}