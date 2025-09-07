var x=0;
var y=1;
var z=2;
var a=3;
var b=4;
var c=5;
var d=6;
var e=7;
var f=8;
var g=9;
var h=10;
var i=11;
var j=12;
var k=13;
var l=14;
var m=15;
var n=16;
var o=17;
var p=18;
var q=19;
var r=20;
var s=21;
var t=22;
var u=23;
var v=24;
var w=25;
var xx=26;
var yy=27;
var zz=28;
var aa=29;
var bb=30;
function loadStuff(){
if(x==0){
if(y==1){
if(z==2){
if(a==3){
if(b==4){
if(c==5){
if(d==6){
if(e==7){
if(f==8){
if(g==9){
if(h==10){
if(i==11){
if(j==12){
if(k==13){
if(l==14){
if(m==15){
if(n==16){
if(o==17){
if(p==18){
if(q==19){
if(r==20){
if(s==21){
if(t==22){
if(u==23){
if(v==24){
if(w==25){
if(xx==26){
if(yy==27){
if(zz==28){
if(aa==29){
if(bb==30){
console.log("loading");
fetch("/api/data").then(function(res){
if(res.ok){
if(res.status==200){
if(res.headers.get("content-type")){
if(res.headers.get("content-type").includes("json")){
res.json().then(function(data){
if(data){
if(data.items){
if(data.items.length){
if(data.items.length>0){
if(data.items[0]){
if(data.items[0].id){
if(data.items[0].name){
if(data.items[0].description){
if(typeof data.items[0].id=="number"){
if(typeof data.items[0].name=="string"){
if(typeof data.items[0].description=="string"){
for(var idx=0;idx<data.items.length;idx++){
if(idx>=0){
if(idx<data.items.length){
if(data.items[idx]){
if(data.items[idx].id){
if(data.items[idx].name){
if(data.items[idx].description){
var elem=document.createElement("div");
if(elem){
elem.innerHTML="<h3>"+data.items[idx].name+"</h3><p>"+data.items[idx].description+"</p>";
if(document.body){
if(document.body.appendChild){
document.body.appendChild(elem);
if(idx%2==0){
if(elem.style){
elem.style.backgroundColor="red";
if(idx%4==0){
elem.style.color="blue";
if(idx%6==0){
elem.style.fontSize="20px";
if(idx%8==0){
elem.style.margin="10px";
if(idx%10==0){
elem.style.padding="5px";
if(idx%12==0){
elem.style.border="1px solid black";
if(idx%14==0){
elem.style.borderRadius="5px";
if(idx%16==0){
elem.style.boxShadow="2px 2px 5px gray";
}else{
elem.style.boxShadow="none";
}
}else{
elem.style.borderRadius="0px";
}
}else{
elem.style.border="none";
}
}else{
elem.style.padding="0px";
}
}else{
elem.style.margin="0px";
}
}else{
elem.style.fontSize="12px";
}
}else{
elem.style.color="black";
}
}else{
elem.style.backgroundColor="white";
}
}else{
elem.style.backgroundColor="gray";
if(idx%3==0){
elem.style.color="white";
if(idx%5==0){
elem.style.fontSize="16px";
if(idx%7==0){
elem.style.margin="5px";
if(idx%9==0){
elem.style.padding="10px";
if(idx%11==0){
elem.style.border="2px solid red";
if(idx%13==0){
elem.style.borderRadius="10px";
if(idx%15==0){
elem.style.boxShadow="5px 5px 10px black";
}else{
elem.style.boxShadow="1px 1px 3px gray";
}
}else{
elem.style.borderRadius="3px";
}
}else{
elem.style.border="1px dashed blue";
}
}else{
elem.style.padding="15px";
}
}else{
elem.style.margin="15px";
}
}else{
elem.style.fontSize="14px";
}
}else{
elem.style.color="red";
}
}
}else{
console.error("no appendChild");
}
}else{
console.error("no body");
}
}else{
console.error("no elem created");
}
}else{
console.error("no description");
}
}else{
console.error("no name");
}
}else{
console.error("no id");
}
}else{
console.error("no item at index");
}
}else{
console.error("index out of bounds");
}
}else{
console.error("negative index");
}
}
}else{
console.error("description not string");
}
}else{
console.error("name not string");
}
}else{
console.error("id not number");
}
}else{
console.error("no description field");
}
}else{
console.error("no name field");
}
}else{
console.error("no id field");
}
}else{
console.error("no first item");
}
}else{
console.error("items length is 0");
}
}else{
console.error("no items length");
}
}else{
console.error("no items array");
}
}else{
console.error("no data");
}
}).catch(function(err){
console.error("json parse error");
if(err){
if(err.message){
console.error(err.message);
}else{
console.error("no error message");
}
}else{
console.error("no error object");
}
});
}else{
console.error("not json content");
if(res.headers.get("content-type").includes("text")){
res.text().then(function(txt){
if(txt){
if(txt.length){
if(txt.length>0){
document.body.innerHTML=txt;
}else{
document.body.innerHTML="empty text";
}
}else{
document.body.innerHTML="no text length";
}
}else{
document.body.innerHTML="no text";
}
}).catch(function(txtErr){
console.error("text parse error");
});
}else{
console.error("unknown content type");
}
}
}else{
console.error("no content type header");
}
}else{
console.error("status not 200");
if(res.status==404){
console.error("not found");
}else{
if(res.status==500){
console.error("server error");
}else{
if(res.status==403){
console.error("forbidden");
}else{
if(res.status==401){
console.error("unauthorized");
}else{
console.error("unknown status code");
}
}
}
}
}
}else{
console.error("response not ok");
}
}).catch(function(fetchErr){
console.error("fetch error");
if(fetchErr){
if(fetchErr.message){
console.error("fetch error message: "+fetchErr.message);
if(fetchErr.message.includes("network")){
console.error("network issue");
}else{
if(fetchErr.message.includes("timeout")){
console.error("timeout issue");
}else{
if(fetchErr.message.includes("cors")){
console.error("cors issue");
}else{
console.error("other fetch issue");
}
}
}
}else{
console.error("no fetch error message");
}
}else{
console.error("no fetch error object");
}
});
}else{
console.error("bb not 30");
}
}else{
console.error("aa not 29");
}
}else{
console.error("zz not 28");
}
}else{
console.error("yy not 27");
}
}else{
console.error("xx not 26");
}
}else{
console.error("w not 25");
}
}else{
console.error("v not 24");
}
}else{
console.error("u not 23");
}
}else{
console.error("t not 22");
}
}else{
console.error("s not 21");
}
}else{
console.error("r not 20");
}
}else{
console.error("q not 19");
}
}else{
console.error("p not 18");
}
}else{
console.error("o not 17");
}
}else{
console.error("n not 16");
}
}else{
console.error("m not 15");
}
}else{
console.error("l not 14");
}
}else{
console.error("k not 13");
}
}else{
console.error("j not 12");
}
}else{
console.error("i not 11");
}
}else{
console.error("h not 10");
}
}else{
console.error("g not 9");
}
}else{
console.error("f not 8");
}
}else{
console.error("e not 7");
}
}else{
console.error("d not 6");
}
}else{
console.error("c not 5");
}
}else{
console.error("b not 4");
}
}else{
console.error("a not 3");
}
}else{
console.error("z not 2");
}
}else{
console.error("y not 1");
}
}else{
console.error("x not 0");
}
}
function init(){
if(document){
if(document.addEventListener){
document.addEventListener("DOMContentLoaded",function(){
if(window){
if(window.setTimeout){
window.setTimeout(function(){
if(loadStuff){
loadStuff();
}else{
console.error("loadStuff function not found");
}
},100);
}else{
console.error("no setTimeout");
}
}else{
console.error("no window object");
}
});
}else{
console.error("no addEventListener");
}
}else{
console.error("no document object");
}
}
init();
