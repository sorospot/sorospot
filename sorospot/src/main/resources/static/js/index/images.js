const inputImagem = document.getElementById("pinImage");
const previewImagem = document.getElementById("previewImagem");
const btnImagem = document.getElementById("btnImg");
const trocaImagem = document.getElementById("trocarImagem");
const removerImagem = document.getElementById("removerImagem");

inputImagem.addEventListener("change", () => {
  const file = inputImagem.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      previewImagem.src = reader.result;
      previewImagem.style.display = "block";
      trocaImagem.setAttribute("state", "enabled");
      btnImagem.style.display = "none";
      removerImagem.setAttribute("state", "enabled");
    };
    reader.readAsDataURL(file);
  }
});

removerImagem.addEventListener("click", () => {
  inputImagem.value = "";
  previewImagem.src = "";
  previewImagem.style.display = "none";
  trocaImagem.setAttribute("state", "disabled");
  btnImagem.style.display = "grid";
  removerImagem.setAttribute("state", "disabled");
});
