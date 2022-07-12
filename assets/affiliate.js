const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const affiliate_old = urlParams.get('rfsn')
// console.log(affiliate_old);

fetch("https://cdn.shopify.com/s/files/1/0026/7229/6025/t/13/assets/refersion.json")
.then(response => {
   return response.json();
})
.then( (data) => {
   let affiliates = data;
   // console.log(affiliates);

   for (var index = 0; index < affiliates.length; ++index) {

      var affiliate = affiliates[index];
     
      if(affiliate.Refersion == affiliate_old){
         // console.log(affiliate.UpPromote);
         var newUrl = location.href.replace("rfsn="+affiliate_old, "sca_ref="+affiliate.UpPromote);
         window.location.href = newUrl;
      }
     }

}
);




// if(affiliate_old == '6210365.d56502'   ) {
//    var newUrl = location.href.replace("rfsn="+affiliate_old, "sca_ref=2119700.hlTd7EzLDV");
//    window.location.href = newUrl;
// }

