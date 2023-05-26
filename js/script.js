document.addEventListener("DOMContentLoaded", function() {
  const linkMenus = document.querySelectorAll(".link__menu");

  function updateSelectedLink() {
    const currentHash = window.location.hash;
    linkMenus.forEach(link => {
      if (link.getAttribute("href") === currentHash) {
        link.classList.add("selected");
      } else {
        link.classList.remove("selected");
      }
    });
  }

  // Adiciona a classe "selected" ao link correto quando a página é carregada
  updateSelectedLink();

  // Atualiza a classe "selected" quando houver alterações no hash da URL
  window.addEventListener("hashchange", updateSelectedLink);
});

// digitação: Desenvolvedor
var texto = "Desenvolvedor";
var array = texto.split("");
var timer;

function frameLooper () {
	if (array.length > 0) {
		document.getElementById("digitacao").innerHTML += array.shift();
	} else {
		clearTimeout(timer);
			}
	loopTimer = setTimeout('frameLooper()',70);

}
frameLooper();

//Fazendo a página 2 funcionar
var projeto1 = document.getElementById('projeto1')
var projeto2 = document.getElementById('projeto2')

projeto1.addEventListener('click', function(){
  window.open('https://fernandorosseto.github.io/Timer/', '_blank');
})

projeto2.addEventListener('click', function(){
  window.open('https://fernandorosseto.github.io/Minha-Mega-Sena/', '_blank');
})

