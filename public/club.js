function showForm(formToShow) {
    let forms = ['loginForm', 'registerForm','homeForm'];
    forms.forEach(form => {
        document.getElementById(form).className = form == formToShow ? '' : 'hide';
    })
    document.querySelectorAll("p.error").forEach(ele => {
        ele.className += " hide";
    })
} 

function hideForm(formToHide) {
    let forms = ['homeForm','loginForm', 'registerForm']
    forms.forEach(form => {
        document.getElementById(form).className = form == formToHide ? '' :'display';
    })
}