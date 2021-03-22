

$(document).ready(function(){
     //******Cambios de modo y loader********
    //Para el DarkMode, compruebo si ya tenia un valor, sino le hago guardar uno

    
    let blanco = localStorage.getItem('estado');

    const modoOscuro = () => {

        if(localStorage.getItem('estado') == undefined){
            let setModoOscuro = confirm('Desea activar el modo oscuro? Este mensaje solo aparecera una vez');
            if(setModoOscuro){
                localStorage.setItem('estado','no');
            }else{
                localStorage.setItem('estado','si');
            }
        }

        blanco = localStorage.getItem('estado');

        if (blanco == 'no') {
            //Si estaba activado entonces lo desactivo
           $('.theme').attr('href','css/black.css');
           //guardo el estado
           
        }else if(blanco == 'si'){
            
            $('.theme').attr('href','css/style.css');
            
            
        }
    }

    $('#btn-submit').click(function (){
         blanco = localStorage.getItem('estado');

        if (blanco == 'si') {
            //Si estaba activado entonces lo desactivo
           $('.theme').attr('href','css/black.css');
           //guardo el estado
            localStorage.setItem('estado','no');
        }else if(blanco == 'no'){
            
            $('.theme').attr('href','css/style.css');
            
            localStorage.setItem('estado','si');
        }

    })

    
    const loader = () =>{
        $('.theme').attr('href','css/loader.css');
    }
    /*
    window.addEventListener('load', () =>{
        //si estaba activado antes entonces lo activo
        
       //modoOscuro();
    })
    */




    //------- FIRESTORE----------------------
    //Iniciamos en db el Firebase.firestore
    const db = firebase.firestore();
    let notaContainer = $('#notas');

    //false es guardar true es editar
    let editStatus = false;

    //guarda el id para editar
    let id = '';

    //funcion que va a subir los datos a la db
    const saveTask = (title, description) =>
       
         db.collection('tasks').doc().set({
            title,
            description
        })
       

    //esta funcion trae la db
    //const getTasks = () => db.collection('tasks').get();
    


   
    

    //Firebase tiene una forma de saber cuando obtiene un cambio
    //onSapshot detecta algun cambio y lo trabajo con la funcion onGetTasks
    function onGetTasks(callback) {
        //loaderActivo();
        console.log('buscando')
        // $('.theme').attr('href','css/loader.css');
        db.collection('tasks').onSnapshot(callback);
        
    }
    
       
    //funcion para borrar tareas
    //recibe como parametro el id que enviamos al llamarla
    //entra a la coleccion tasks y busca entre sus documentos el que tenga ese id y lo borra

    const deleteTask = id => db.collection('tasks').doc(id).delete();

   //busca con el id que le pase lo que tiene el doc
   const  getTask = (id) => db.collection('tasks').doc(id).get();
    
   //recibe el id y los valores a actualizar
   const updateTasks = (id, updatedTask) => {
        //busca el documento con ese id y le cambia esos valores que le pase

        db.collection('tasks').doc(id).update(updatedTask);
   }

    //funcion para ver si hay cambios en firestore    
    //cada vez que pase algo nuevo en la db ejecuto y me traigo los datos con querySnapshot
    onGetTasks((querySnapshot) => {
        modoOscuro()
        console.log('ya esta')
        
        //limpia ('borra las notas') para evitar duplicados anteriores
        notaContainer.html('');
        //recorre en un bucle cada documento
        
        querySnapshot.forEach(doc =>{
           
            //lo guarda en tarea, doc.data devuelve lo que tenga guardado
            const tarea = doc.data();

            //traigo el id y se lo agrego en html como atributo data-id

            tarea.id = doc.id;
            //imprime en el html una plantilla del div con valor de h1 tarea.title y en p tarea.description
            notaContainer.append(`
               <div class="nota" id='nota'>
                    <h1 class="nota-titulo" id='nota-titulo'>
                         ${tarea.title}
                    </h1>
                        <hr class="nota-separacion">
                        <p class="nota-texto" id='nota-descripcion'>
                            ${tarea.description}
                    </p>
                    <div class="container-btn">
                        
                        <button  class="nota-editar btn-edit"  data-id='${tarea.id}'>Editar</button>
                        <button  class="btn nota-borrar btn-delete" data-id='${tarea.id}' >Borrar</button>
                    </div>
                </div>`);

                
            })
            
            // querySelectorAll selecciona todos los elementos con cierta clase y los guarda como un arreglo
            const btnsDelete =  document.querySelectorAll('.btn-delete');
           // recorro el arreglo y para cada elemento agrego el evento click
            btnsDelete.forEach(btn =>{
                $(btn).click( async function(e){
                    //va  a tener el id propio desde firestore
                   // console.log(e.target.dataset.id)
                   //envia ese id como parametro de deleteTasks
                   loader();
                   await deleteTask(e.target.dataset.id);
                   modoOscuro();
                })
                  
                
            })

            //para editar hacemos algo parecido
            const btnsEdit = document.querySelectorAll('.btn-edit');
            btnsEdit.forEach(btn =>{
                $(btn).click(async function(e){
                   //ejecuto getTask para llevar los datos al form y guardo lo que devuelve en doc
                    loader();
                    const doc = await getTask(e.target.dataset.id);
                    modoOscuro();
                    //pongo esos valores en los inputs
                    $('#task-title').val(doc.data().title);
                    $('#task-textarea').val(doc.data().description);

                    //cambio el estado del form(si va a ser crear o editar)
                    editStatus = true;
                    //en la variable global id le mando cual id aprete
                    id = e.target.dataset.id;
                    //cambio el valor del btn del form
                    $('#btn-task-form').val('Editar')
                })
                  
                
            })
            
    })
        
    
    
    //si se hace clicl en el btn de enviar
    $('#btn-task-form').click(async function(){
        loader();
        //guardo los datos al hacer click

        let title = $('#task-title').val();
        let description = $('#task-textarea').val();
        
        //si es false editStatus entonces es para crear
        if (!editStatus) {
            //llama y espera la ejecucion de saveTask
            await saveTask(title, description);
        } else {
            //es para editar
            //espera la funcion de updateTasks, manda la global id y el valor de titulo y description
            await updateTasks(id,{
                title,
                description
            });

            //vuelve a poner el form en modo crear
            editStatus = false;
            $('#btn-task-form').val('Crear');
            id= '';
        }
       
        //reseteo los campos

        $('#task-title').val('');
        $('#task-textarea').val('');

        
        modoOscuro();
        
    })
     
    loader();
})