// from thingmaker old ka account https://www.khanacademy.org/profile/kaid_1192481548237719607966796
// Nov 19, 2020
function person(first,last,age,gender){
  this.name={
    'first':first,
    'last':last
  };
  this.age=age;
  this.gender=gender;
}
person.prototype.grow=function(growby){
  if(growby){
    this.age+=growby;
  }else{
    this.age++;
  }
};
person.prototype.change=function(first,last,age,gender){
  this.name={
    'first':first,
    'last':last
  };
  this.age=age;
  this.gender=gender;
};
person.prototype.say=function(message){
println(this.name.first+" "+this.name.last+" says: \""+message+"\"");
};



var bob = new person("Bob","Smith",20,"male");
bob.grow(10);
bob.say("I am "+bob.age+" years old!");
bob.say("I am a "+bob.gender);

draw = function() {};
