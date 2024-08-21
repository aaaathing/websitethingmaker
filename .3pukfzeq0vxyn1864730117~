function parseV3(data){
  var hatTypes = [
    ["event_whenflagclicked", "green_flag"],
    ["event_whenbroadcastreceived", "broadcast_receive"]
  ];

  var reference = {
    event_whenflagclicked:"whenGFClicked",
    event_broadcast:"Trigger.broadcast",
    event_broadcastandwait:"Trigger.broadcastWait",
    motion_movesteps:"moveSteps",
    motion_turnright:"turnR",
    motion_turnleft:"turnL",
    motion_pointindirection:"pointInDirection",
    motion_pointtowards:"pointAt",
    motion_pointtowards_menu:" ",
    motion_goto:"gotoStr",
    motion_gotoxy:"goto",
    motion_goto_menu:" ",
    motion_glidesecstoxy:"glideTo",
    motion_glideto:"glideToStr",
    motion_glideto_menu:" ",
    motion_changexby:"changeXBy",
    motion_changeyby:"changeYBy",
    motion_setx:"setX",
    motion_sety:"setY",
    motion_xposition:"x",
    motion_yposition:"y",
    motion_direction:"dir",
    looks_sayforsecs:"sayFor",
    looks_say:"say",
    looks_switchcostumeto:"setCostume",
    looks_costume:" ", //costume menu
    looks_nextcostume:"nextCostume",
    looks_switchbackdropto:"Project.stage.setCostume",
    looks_nextbackdrop:"Project.stage.nextCostume",
    looks_backdrops:" ", //backdrop menu
    looks_changesizeby:"changeSize",
    looks_setsizeto:"setSize",
    looks_changeeffectby:"changeGraphicEffect",
    looks_seteffectto:"setGraphicEffect",
    looks_show:"show",
    looks_hide:"hide",
    looks_costumenumbername:"costumeNumOrName",
    looks_backdropnumbername:"Project.stage.costumeNumOrName",
    looks_size:"size",
    sound_play:"startSound",
    sound_sounds_menu:" ",
    sound_playuntildone:"playSound",
    sound_stopallsounds:"Project.stopAllSounds",
    control_wait:"wait",
    control_forever:"while(true)",
    control_if:"if",
    control_if_else:"if",
    control_stop:"stop",
    sensing_distanceto:"distanceTo",
    sensing_distancetomenu:" ",
    sensing_mousedown:"mouseDown",
    sensing_mousex:"mouseX",
    sensing_mousey:"mouseY",
    sensing_keypressed:"keyPressed",
    sensing_keyoptions:" ",
    sensing_username:"Project.username",
    sensing_timer:"Project.timer",
    sensing_resettimer:"Project.resetTimer",
    operator_random:"random",
    operator_round:"Math.round",
    operator_mathop:"mathOption",
    data_setvariableto:"setVar",
    data_changevariableby:"changeVar",
    data_showvariable:"showVar",
    data_hidevariable:"hideVar",
    pen_clear:"penClear",
    pen_stamp:"penStamp",
    pen_penDown:"penDown",
    pen_penUp:"penUp",
    pen_setPenColorToColor:"setPenColor",
    pen_changePenColorParamBy:"changePen",
    pen_setPenColorParamTo:"setPen",
    pen_menu_colorParam:" ",
    pen_changePenSizeBy:"changePenSize",
    pen_setPenSizeTo:"setPenSize",
  }

  var substack2 = {
    control_if_else:"else"
  };

  var yieldBlocks = [
    "motion_glidesecstoxy",
    "motion_glideto",
    "looks_sayforsecs",
    "sound_playuntildone",
    "event_broadcastandwait",
    "control_wait",
    "control_wait_until"
  ]
  var yieldLoops = [
    "control_forever"
  ]
  var notBlocks = [//only for scratchValue
    "motion_xposition",
    "motion_yposition",
    "motion_direction",
    "looks_size",
    "sensing_mousedown",
    "sensing_mousex",
    "sensing_mousey",
    "sensing_username",
    "sensing_timer",
  ];
  var notMes = [
    "event_broadcast",
    "event_broadcastandwait",
    "motion_pointtowards_menu",
    "motion_glideto_menu",
    "motion_goto_menu",
    "looks_costume", //costume menu
    "looks_switchbackdropto",
    "looks_nextbackdrop",
    "looks_backdrops", //backdrop menu
    "looks_backdropnumbername",
    "sound_sounds_menu",
    "sound_stopallsounds",
    "sensing_distancetomenu",
    "sensing_mousedown",
    "sensing_mousex",
    "sensing_mousey",
    "sensing_keypressed",
    "sensing_keyoptions",
    "sensing_username",
    "sensing_timer",
    "sensing_resettimer",
    "operator_random",
    "operator_round",
    "operator_mathop",
    "pen_menu_colorParam",
  ];
  
  var structures = {
    control_repeat:["for(var i=0;i<INPUT_TIMES;i++){yield* (function*(){INPUT_SUBSTACK})();yield;}", "for(var i=0;i<INPUT_TIMES;i++){yield* (function*(){INPUT_SUBSTACK})()}"],
    control_wait_until:["while(!(INPUT_CONDITION)){yield;}"],
    control_repeat_until:["while(!(INPUT_CONDITION)){INPUT_SUBSTACKyield;}"],
    control_stop:[`if(FIELD_STOP_OPTION === 'all'){Project.stop()}
else if(FIELD_STOP_OPTION === 'this script'){return}
else if(FIELD_STOP_OPTION === 'other scripts in sprite'){
  
}`],
    operator_add:["(INPUT_NUM1+INPUT_NUM2)"],
    operator_subtract:["(INPUT_NUM1-INPUT_NUM2)"],
    operator_multiply:["(INPUT_NUM1*INPUT_NUM2)"],
    operator_divide:["(INPUT_NUM1/INPUT_NUM2)"],
    operator_lt:["(INPUT_OPERAND1<INPUT_OPERAND2)"],
    operator_equals:["(INPUT_OPERAND1==INPUT_OPERAND2)"],
    operator_gt:["(INPUT_OPERAND1>INPUT_OPERAND2)"],
    operator_and:["(INPUT_OPERAND1&&INPUT_OPERAND2)"],
    operator_or:["(INPUT_OPERAND1||INPUT_OPERAND2)"],
    operator_not:["(!INPUT_OPERAND)"],
    operator_join:["(''+INPUT_STRING1+INPUT_STRING2)"],
    operator_letter_of:["String(INPUT_STRING)[INPUT_LETTER-1]"],
    operator_length:["String(INPUT_STRING).length"],
    operator_contains:["String(INPUT_STRING1).includes(INPUT_STRING2)"],
    operator_mod:["(INPUT_NUM1%INPUT_NUM2)"],
    argument_reporter_string_number:["args[FIELD_VALUE]"],
    argument_reporter_boolean:["args[FIELD_VALUE]"],
  };
  
        
        var jsCode = "var INPUT_OPERAND1,INPUT_OPERAND2,INPUT_CONDITION;";
        
        var sprites = data.targets;
        var globVars = sprites[0].variables;
        
        for(var i=0; i<sprites.length; i++){
          var sprite = sprites[i];
          var scripts = sprite.blocks;
          var vars = sprites[i].variables;
          var stacks = [];
          var stackNames = [];
          var js = [];
          
          function trigFromHat(h){
            for(var i=0; i<hatTypes.length; i++){
              if(hatTypes[i][0] === h){
                return hatTypes[i][1];
              }
            }
          }
          
          var costumes = sprite.costumes;
          for(var ci=0; ci<costumes.length; ci++){
            var c = "new Costume(\""
            c += "https://cdn.assets.scratch.mit.edu/internalapi/asset/"+costumes[ci].md5ext+"/get";
            c += "\",{centerX:"+costumes[ci].rotationCenterX+",";
            c += "centerY:"+costumes[ci].rotationCenterY+",";
            c += "bitmapResolution:"+costumes[ci].bitmapResolution+"}";
            c += ",\""+costumes[ci].name+"\")";
            costumes[ci] = c;
          }
          costumes = "["+costumes.join(",")+"]"
          
          var sounds = sprite.sounds;
          for(var si=0; si<sounds.length; si++){
            var s = "new Sound(\"";
            s += "https://cdn.assets.scratch.mit.edu/internalapi/asset/"+sounds[si].md5ext+"/get";
            s += "\",{";
            s += "},\""+sounds[si].name+"\")";
            sounds[si] = s;
          }
          sounds = "["+sounds.join(",")+"]";
          if(i === 0){
            //stage
            jsCode += "var sprite=Project.stage;sprite.costumes="+costumes+";";
            jsCode += "sprite.currentCostume="+sprite.currentCostume+";";
            jsCode += "sprite.sounds="+sounds+";";
          }else{
            jsCode += "var sprite=new Sprite(\""+sprites[i].name+"\","+costumes+","+sounds+",{costume:"+sprite.currentCostume+"});"
            jsCode += "Project.addSprite(sprite);";
          }
          
          //set variables
          var vars = sprite.variables;
          for(var v in vars){
            if(typeof vars[v][0] === "string"){
              vars[v][0] = vars[v][0].replace(/\\/g,"\\\\").replace(/"/g,"\\\"");
            }
            jsCode += "sprite.vars[\""+vars[v][0]+"\"]=\""+vars[v][1]+"\";";
          }
          if(i !== 0){
            jsCode += "sprite.showing="+sprite.visible+";";
            jsCode += "sprite.goto("+sprite.x+","+sprite.y+");";
            jsCode += "sprite.setSize("+sprite.size+");";
            jsCode += "sprite.pointInDirection("+sprite.direction+");";
          }
            
          //get hats
          for(var b in scripts){
            var block = scripts[b];
            var isHat = trigFromHat(block.opcode);
            if(block.topLevel && isHat){
              block.opcode = reference[block.opcode] || block.opcode
              stacks.push([block]);
              stackNames.push([block.opcode])
              var trigVal = JSON.stringify(Object.assign(block.inputs, block.fields));
              js.push(["Trigger.add(\""+isHat+"\","+trigVal+",sprite[\""+block.opcode+"\"]=function*(me, triggerNum){"])
            }
          }
          
          //custom blocks
          //{
            for(var c in scripts){
              var block = scripts[c];
              if(block.opcode === "procedures_definition"){
                var customBlock = scripts[block.inputs.custom_block[1]];
                var mutation = customBlock.mutation
                var funcName = mutation.proccode;
                js.push(["sprite.funcs[\""+funcName+"\"]"]);
                var s = js.length - 1;
                stacks.push([block]);
                stackNames.push([block.opcode]);
                
                /*var args = JSON.parse(mutation.argumentids);
                for(var a = 0; a<args.length; a++){
                  var input = scripts[customBlock.inputs[args[a]][1]];
                  args[a] = input.fields.VALUE[0];
                }*/
                
                var argIds = JSON.parse(mutation.argumentids);
                var argNames = JSON.parse(mutation.argumentnames);
                
                js[s].push("=function*(args,me){");
                
                var argObj = "{";
                for(var a=0; a<argIds.length; a++){
                  var argId = argIds[a];
                  var argNam = argNames[a];
                  
                  var prop = '"'+argNam+'":' + "args[\""+argId+"\"],";
                  
                  argObj += prop;
                }
                argObj += "};";
                
                js[s].push("args="+argObj);
                
                var next = block.next;
                Stack(next, s, false, false, false, mutation.warp);
                
                var funcCode = js[s].join("\n")+";";
                js.splice(s, 1);
                stacks.splice(s, 1);
                stackNames.splice(s, 1);
                jsCode += funcCode;
              }
            }
            function CustomBlockCall(inps, block){
              inps = inps || block.inputs;
              
              var mutation = block.mutation;
              
              var funcName = mutation.proccode;
              var callCode = "yield* me.funcs[\"" + funcName + "\"]";
              
              callCode += "({";
              var argIds = JSON.parse(mutation.argumentids);
              for(var i = 0; i<argIds.length; i++){
                var id = argIds[i];
                var inp = block.inputs[id] ? scratchValue(block.inputs[id]) : "null";
                
                var prop = '"'+id+'":'+inp+",";
                callCode += prop;
              }
              callCode += "},me);";
              
              return callCode;
            }
          //}
          
          //parse values
          function scratchValue(inp, isField){
            var v = inp;
            if(isField){
              v = v[0];
              if(String(parseFloat(v)) === v){
                //number
                return v;
              }else{
                //string
                return "\""+v+"\"";
              }
              return v;
            }else{
              v = v[1];
              if(Array.isArray(v)){
                var isVar = v[2];
                v = v[1];
                if(isVar && (vars[isVar] || globVars[isVar]) ){
                  var varName = vars[isVar] || globVars[isVar];
                  if(!varName)return;
                  varName = varName[0];
                  if(vars[isVar]){
                    return "me.vars[\""+varName+"\"]";
                  }else{
                    return "Project.stage.vars[\""+varName+"\"]";
                  }
                }else{
                  if(String(parseFloat(v)) === v){
                    //number
                    return v;
                  }else{
                    //string
                    if(v === "true"){
                      return "true";
                    }else if(v === "false"){
                      return "false";
                    }else{
                      return v ? "\""+v+"\"" : "\"\"";
                    }
                  }
                }
              }else{
                //its a block
                var block = scripts[v];
                if(!block){return "undefined"}
                var originOpcode = block.opcode;
                block.opcode = reference[block.opcode] || block.opcode;
                var isMe = notMes.includes(originOpcode) ? "" : "me."
                if(structures[originOpcode]){
                  return Structure(structures[originOpcode], block);
                }else{
                  if(notBlocks.includes(originOpcode)){
                    return isMe+block.opcode;
                  }else{
                    var resVal = [];
                    for(var a in block.inputs){
                      resVal.push(scratchValue(block.inputs[a]));
                    }
                    for(var a in block.fields){
                      resVal.push(scratchValue(block.fields[a], true));
                    }
                    var opStr = isMe+block.opcode +"("+ (resVal.join(",")) + ")"

                    return opStr;
                  }
                }//end structures[opcode]
              }
            }
          }
          
          function Structure(structure, block, s, turbo_warp){
            if(turbo_warp && structure[1]){
              structure = structure[1]
            }else{
              structure = structure[0];
            }
            for(var inp in block.inputs){
              var regex = new RegExp("INPUT_"+inp, "g");
              var isStack = inp.includes("SUBSTACK");
              if(isStack){
                if(block.inputs[inp][1]){
                  structure = structure.replace(regex, Stack(block.inputs[inp][1], s, false, true, true, turbo_warp));
                }else{
                  structure = structure.replace(regex, "");
                }
              }else{
                structure = structure.replace(regex, scratchValue(block.inputs[inp]))
              }
            }
            for(var fie in block.fields){
              var regex = new RegExp("FIELD_"+fie, "g");
              structure = structure.replace(regex, scratchValue(block.fields[fie], true))
            }
            return structure;
          }
          
          //get other part of stacks
          function Stack(next, s, yieldL, returnNotPush, NOextraBracket, turbo_warp){
              var returnVal = "";
              var jsPushFunc = js[s].push;
              if(returnNotPush){js[s].push = function(what){returnVal += "\n"+what}}
              
              next = next || stacks[s][0].next;
              while(next){
                var block = scripts[next];
                var originOpcode = block.opcode;
                block.opcode = reference[block.opcode] || block.opcode;
                stacks[s].push(block);
                stackNames[s].push(block.opcode);
                if(originOpcode === "procedures_call"){
                  js[s].push(CustomBlockCall(block.inputs, block));
                }else if(structures[originOpcode]){
                  js[s].push(Structure(structures[originOpcode], block, s, turbo_warp));
                }else{
                  if(block.inputs.SUBSTACK){
                    var loopCode = "";
                    if(block.inputs.CONDITION){
                      loopCode += "(";
                      loopCode += scratchValue(block.inputs.CONDITION);
                      loopCode += ")";
                    }
                    js[s].push(block.opcode+loopCode+"{");
                  }else{
                    //assingment
                    var ass = "";
                    if(yieldBlocks.includes(originOpcode)){ass += "yield* "}
                    ass += (notMes.includes(originOpcode) ? "" : "me.")+block.opcode;
                    ass += "(";
                    var firIter = true;
                    for(var v in block.inputs){
                      var inp = block.inputs[v];
                      if(firIter){
                        firIter = false;
                      }else{
                        ass += ",";
                      }
                      ass += scratchValue(inp);
                    }
                    for(var v in block.fields){
                      var inp = block.fields[v];
                      if(firIter){
                        firIter = false;
                      }else{
                        ass += ",";
                      }
                      ass += scratchValue(inp, true);
                    }
                    ass += ")";
                    js[s].push(ass+";");
                  }
                  var stackNum = stacks.length-1;

                  if(block.inputs.SUBSTACK){
                    //its a loop block

                    var substack = block.inputs.SUBSTACK;
                    var substackL = substack[0];
                    var ssNext = substack[1];
                    Stack(ssNext, s, yieldLoops.includes(originOpcode), false, false, turbo_warp);
                    var blockSS2 = substack2[originOpcode];
                    if(blockSS2 && block.inputs.SUBSTACK2){
                      var substack = block.inputs.SUBSTACK2;
                      var substackL = substack[0];
                      var ssNext = substack[1];
                      js[s].push(blockSS2+"{");
                      Stack(ssNext, s);
                    }
                  }

                }
                next = block.next;
              }
              if(yieldL && !turbo_warp){
                js[s].push("yield;")
              }
              if(!NOextraBracket)js[s].push("}");
              
              js[s].push = jsPushFunc
              if(returnNotPush){return returnVal}
          }
          
          
          for(var s=0; s<stacks.length; s++){
            Stack(null, s)
            js[s].push(",sprite);");//part of the Trigger.add
          }
          
          //js array to js strig
          for(var j=0; j<js.length; j++){
            js[j] = js[j].join("\n")
          }
          js = js.join("\n")
          
          jsCode += js;
        }
        
        jsCode += "\n";
        var monitors = data.monitors;
        for(var m=0; m<monitors.length; m++){
          var monitor = monitors[m];
          if(monitor.opcode === "data_variable"){
            jsCode += "Project.addMonitor(new monitor.variable."+monitor.mode+"("
            jsCode += monitor.value+",";
            jsCode += monitor.x + "," + monitor.y + ",";
            if(monitor.spriteName === null){
              jsCode += "[\"stage\",\""+monitor.params.VARIABLE+"\"]";
            }else{
              jsCode += "[\"sprite\",\""+monitor.spriteName+"\",\""+monitor.params.VARIABLE+"\"]";
            }
            jsCode += ","+monitor.visible+",";
            jsCode += `${monitor.sliderMin},${monitor.sliderMax},${monitor.isDiscrete}`;
            jsCode += "));"
          }
        }
        return jsCode;
}