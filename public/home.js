function fixTypeInput(input){

    if (input.value == '') {input.value = 0;}
    if (input.value < 0)   {input.value = 0;}
    if (input.value > 100) {input.value = 100;}
    input.value = parseInt(input.value, 10);

}

function fixHWInput(input){

    if (input.value == '') {input.value = 0;}
    if (input.value < 0)   {input.value = 0;}
    input.value = parseInt(input.value, 10);

}

function fixTypeInputUpdate(input){

    if (input.value == '') {input.value = 0;}
    if (input.value < 0)   {input.value = 0;}
    if (input.value > 100) {input.value = 100;}
    totalElem = document.getElementById('total')
    total = parseInt(totalElem.value, 10);
    console.log(totalElem.value);
    console.log(input.old, input.value);
    total += parseInt(input.value,10) - parseInt(input.old,10);
    input.old = input.value;
    totalElem.value = total;
    return total;

}

function submitChange(){

    document.getElementById('tokiform').action = '/alter';
    document.getElementById('tokiform').submit();

}

function deleteEntry(){

    document.getElementById('tokiform').action = '/delete';
    document.getElementById('tokiform').submit();  

}

/*function register() {

    name = document.getElementById('name').value;
    height = document.getElementById('height').value;
    weight = document.getElementById('weight').value;
    fly = document.getElementById('fly').value;
    fight = document.getElementById('fight').value;
    fire = document.getElementById('fire').value;
    water = document.getElementById('water').value;
    electric = document.getElementById('electric').value;
    ice = document.getElementById('ice').value;
    trainer = document.getElementById('trainer').value;


    if (name.validity.valueMissing==false){}
}*/