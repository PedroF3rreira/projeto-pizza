let cart = [];
let modalKey = 0;
let modalQt = 1;

//seleciona elementos
const select = el => document.querySelector(el);//auxilia na seleção dos elementos
const selectAll = el => document.querySelectorAll(el);

//listagem dos items
pizzaJson.map( (pizza, index) => {

	//clonando estrutura html utilizando true no cloneNode pra clonar elementos completos
	let pizzaItem = select('.models .pizza-item').cloneNode(true);
	
	pizzaItem.setAttribute('data-key', index)
	pizzaItem.querySelector('.pizza-item--img img').src = pizza.img;
	pizzaItem.querySelector('.pizza-item--price').innerHTML = `R$ ${pizza.price.toFixed(2)}`;
	pizzaItem.querySelector('.pizza-item--name').innerHTML = pizza.name;
	pizzaItem.querySelector('.pizza-item--desc').innerHTML = pizza.description;
	
	//abrindo modal
	pizzaItem.querySelector('a').addEventListener('click', (e) => {
			//evitando que atualização da tela muda evento default
			e.preventDefault();

			//identificando qual item foi clicado
			//closest pega classe mais proxima com nome passado no parametro
			let key = e.target.closest('.pizza-item').getAttribute('data-key');
			modalKey = key;
			
			//animação do modal
			select('.pizzaWindowArea').style.opacity = 0;
			select('.pizzaWindowArea').style.display = 'flex';
			setTimeout(() => {
				select('.pizzaWindowArea').style.opacity = 1;
			}, 200)

			select('.pizzaBig img').src = pizzaJson[key].img;
			select('.pizzaInfo h1').innerHTML = pizzaJson[key].name;
			select('.pizzaInfo--desc').innerHTML = pizzaJson[key].description;
			select('.pizzaInfo--actualPrice').innerHTML = `R$ ${pizzaJson[key].price.toFixed(2)}`;
			select('.pizzaInfo--size.selected').classList.remove('selected');

			//popula os tamanhos e reseta o selected
			selectAll('.pizzaInfo--size').forEach((size, sizeIndex) => {
				if(sizeIndex == 2){
					size.classList.add('selected');
				}
				size.querySelector('span').innerHTML = pizzaJson[key].sizes[sizeIndex];
			})
			
			select('.pizzaInfo--qt').innerHTML = modalQt;
			
	})
	//utilizando append para adicionar elementos mantendo os de antes
	document.querySelector('.pizza-area').append(pizzaItem);
})

//eventos do modal
function qtMais () {
	select('.pizzaInfo--qt').innerHTML = modalQt += 1
}

function qtMenos () {
	if(modalQt > 1)
		select('.pizzaInfo--qt').innerHTML = modalQt -= 1
}

function closeModal () {
	select('.pizzaWindowArea').style.opacity = 0;	
	setTimeout(() => {
		select('.pizzaWindowArea').style.display = 'none';
	}, 200)
	modalQt = 1;
}
//adicionando evento para fechar modal mobile e web
selectAll('.pizzaInfo--cancelMobileButton, .pizzaInfo--cancelButton').forEach((item) =>{
	item.addEventListener('click', (e) =>{
		closeModal()
		modalQt = 1
	}
)});
//altera seleção dos tamanhos no modal
selectAll('.pizzaInfo--size').forEach((size) =>{
	size.addEventListener('click', (e) =>{
		select('.pizzaInfo--size.selected').classList.remove('selected');
		size.classList.add('selected');
	})
});

//adicionando items ao carrinho
select('.pizzaInfo--addButton').addEventListener('click', e => {
	//pega tamanho selecionado
	let size = parseInt(select('.pizzaInfo--size.selected').getAttribute('data-key')); 
	
	//identificador para filtro de adição de items
	let identifier = `${pizzaJson[modalKey].id}@${size}`;

	//verifica o identificador antes de adicionar
	let key = cart.findIndex(item => item.identifier == identifier);
	
	if(key > -1){
		cart[key].qt += modalQt;
	}
	else{
		cart.push({
			identifier,
			id: pizzaJson[modalKey].id,
			size,
			qt:modalQt
		});
	}
	updateCart();
	closeModal();
});	
//Abre o menu no mobile
select('.menu-openner').addEventListener('click', () =>{
	if(cart.length > 0)
		select('aside').style.left = '0';
});
//fecha o menu no mobile
select('.menu-closer').addEventListener('click', () =>{
	select('aside').style.left = '100vw';

});

//cuida da renderização dos items do carrinho e a iteratividade do mesmo
function updateCart() {

	select('.menu-openner span').innerHTML = cart.length;

	if(cart.length > 0){		
		//mostra carrinho
		select('aside').classList.add('show');
		
		let subTotal = 0;
		let descont = 0;
		let total = 0;
		
		//limpa o cart para não repetir o item
		select('.cart').innerHTML = '';
		
		//itera sobre o array cart
		for(let i in cart){
			//filtra item por item do pizzaJson pelo id dos items do cart
			let pizzaItem = pizzaJson.find( item => item.id == cart[i].id);
			
			subTotal += pizzaItem.price * cart[i].qt;

			//clona estrutura
			let cartItem = select('.models .cart--item').cloneNode(true);

			let pizzaSizeName;
			
			switch(cart[i].size){
				case 0:
					pizzaSizeName = 'P';
					break;
				case 1:
					pizzaSizeName = 'M';
					break;
				case 2:
					pizzaSizeName = 'G';
					break;
			}

			let pizzaName = `${pizzaItem.name} (${pizzaSizeName})`;

			cartItem.querySelector('img').src = pizzaItem.img;
			cartItem.querySelector('.cart--item-nome').innerHTML = pizzaName;
			cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;
			
			cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', e =>{
				if(cart[i].qt > 1){
					cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt -= 1;
				}
				else{
					cart.splice(i,1);
				}
				updateCart();
			});

			cartItem.querySelector('.cart--item-qtmais').addEventListener('click', e =>{
				cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt += 1;
				updateCart();
			});

			cartItem.querySelector('.cart--item-qtDelete').addEventListener('click', e =>{
				cart.splice(i, 1);
				updateCart();
			});

			//da um push nos elemtos clonados e populados
			select('.cart').append(cartItem);
		}

		descont = subTotal * 0.1;
		total = subTotal - descont;

		selectAll('.subtotal span')[1].innerHTML = `R$ ${subTotal.toFixed(2)}`;
		selectAll('.desconto span')[1].innerHTML = `R$ ${descont.toFixed(2)}`;
		selectAll('.total span')[1].innerHTML = `R$ ${total.toFixed(2)}`;
	}
	else{
		select('aside').classList.remove('show');//feche menu quando cart == 0
		select('aside').style.left = '100vw';//feche menu quando cart == 0 no mobile
	}
}