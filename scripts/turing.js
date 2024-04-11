$(function() {

    $('#cargar').click(function(){
        id = ID;
        if($('#cadena').val() == ""){
            $(this).popover('show');
            return false;
        }else{
            $(this).popover('hide');
            LoadString(id)
            Clear();
            return true;
        }
    });

    $('#evaluar').click(

        function(){
            id = ID;
            time = 1000 - $("#rango").val();
            Tick = setInterval(function(){Evaluate(id)}, time);
        }

    );
});

  /******************/
 /* CORE FUNCTIONS */
/******************/

function AddBlank(table){
    for(i = 0; i < 100; i++){
        AddRow(BLANK, "", "", table);
    }
    return true;
}

function LoadString(table){
    var cadena = $('#cadena').val();
        ClearRows(table);
        AddRow(cadena.charAt(0), "active-row", "bg-info text-light", table);
        for(i = 1; i < cadena.length; i++){
            AddRow(cadena.charAt(i), "", "", table);
        }
        AddBlank(table);
        return true;
}

function EvaluateStep(symbol, id){
    Machines[id].Count++;
    symbols = Machines[id][Machines[id].State]

    if(symbols[symbol] == undefined) return { Error : true, Acceptable : Machines[id].Functions.Acceptable(Machines[id].State), Message : `El símbolo <strong>'${symbol}'</strong> no tiene transición definida en el estado <strong>${Machines[id].State}</strong> de esta máquina. ${symbols.ERROR ? symbols.ERROR : ''}`};

    NextValues = symbols[symbol];
    Machines[id].State = NextValues[1];
    return { Error : false, Acceptable: Machines[id].Functions.Acceptable(Machines[id].State), Output : NextValues[0], Movement : NextValues[2] };
}

function Evaluate(id){
        chain = $("#tabla" + id + " td");
        i = Machines[id].i;

        if(!Machines[id].Functions.Acceptable(Machines[id].State) && chain.length > i && Machines[id].Count < 10000){
            time = 1000 - $("#rango").val();
            result = EvaluateStep(chain[i].textContent.trim(), id);
            if(result.Error){
                Update();
                Stop();
                $('#modalTitle').html('¡Error!');
                $('#modalText').html(result.Message);
                $('#myModal').modal('show');
               
            }else{
                if (i >= chain.length - 2) AddBlank(id);
                chain[i].textContent = (result.Output);
                i += result.Movement;
                Machines[id].i += result.Movement;
                chain[i].setAttribute('id', 'new-row');
                ChangeActiveRow(id, time);
                Update();
            }

            
        }else{
            if(Machines[id].Functions.Acceptable(Machines[id].State)){
                Update();            
                Stop();
                $('#modalTitle').html('Cadena válida.');
                $('#modalText').html('La cadena ingresada es válida. Puede ver el resultado en la cinta.');
                $('#myModal').modal('show');
                
            }
    
            if(Machines[id].Count >= 10000){
                Update();
                Stop();
                $('#modalTitle').html('¡Error!');
                $('#modalText').html('La cadena ingresada ha generado muchas transiciones sin definir un resultado.');
                $('#myModal').modal('show');
            }
        }

        
}

function Stop(){
    clearInterval(Tick);
}

// SYNTAXIS Machine[CURRENT_STATE] = { INCOMING_SYMBOL: [OUTPUT_SYMBOL, NEXT_STATE, HEAD_MOVEMENT]}

function SetMachine1(){
    Machines[1][0] = {
        '1' : ['X', 1, 1],
        '+' : ['+', 0, 1],
        '=' : ['=', 3, 1],
        "ERROR" : "La máquina dice: cadena vacía o formato incorrecto."
    };

    Machines[1][1] = {
        '1' : ['1', 1, 1],
        '+' : ['+', 4, 1],
        '=' : ['=', 1, 1],
        'ß' : ['1', 2, -1]
    };

    Machines[1][2] = {
        '1' : ['1', 2, -1],
        '+' : ['+', 2, -1],
        '=' : ['=', 2, -1],
        'X' : ['1', 0, 1]
    };

    Machines[1][3] = {
        '1' : ['1', 3, 1],
        'ß' : ['1', 3, 1]
    };

    Machines[1][4] = {
        '1' : ['1', 1, 1],
        "ERROR" : "La máquina dice: no existe símbolo unario después del símbolo operador."
    };

    Machines[1]['i'] = 0;
    Machines[1]['Count'] = 0;
    Machines[1]['State'] = 0;
    Machines[1]['Functions'] = {
        Acceptable(state) { return state == 3 }
    };
}