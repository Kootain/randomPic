var src = document.createElement('script');

var code =
`var changeA=function(){
  $('.photo__image-container img').each(function (idx, element) {
    element.src='https://images.unsplash.com/photo' + element.src.match(/-[0-9 a-z -]+/) + '?dpr=1.00&fit=crop&fm=jpg&h=280&q=100&w=1200'; 
    $(element).css('height','auto');
  });
};
var button = document.createElement('a');
button.innerText = 'Change';
button.addEventListener('click',changeA);
document.getElementsByClassName('navbar__links-container navbar__links-container--center')[0].appendChild(button);
`;

src.innerText = code;
document.body.appendChild(src);
