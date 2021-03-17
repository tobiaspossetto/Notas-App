$(document).ready(function(){
    let estado = 0;
    $('.theme').attr('href','css/style.css');
    $('#btn-submit').click(function(){
        
        if (estado == 0) {
            estado = 1;
        }else{
            estado = 0;
        }
        if(estado == 1){
           // $('.btn-submit').css('float','right');
           $('.theme').attr('href','css/black.css');
           
        }else{
           // $('.btn-submit').css('float','left');

            $('.theme').attr('href','css/style.css');
        }
    })

})