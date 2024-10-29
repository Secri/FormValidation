class FormValidation {
				
				static eltHandled    = ['input', 'textarea', 'fieldset'];
				
				static usableRegex   = {
											   email: /^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i,
											password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])\S{8,}$/,
											    date: /^((?:19|20)[0-9][0-9])-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/,
											  number: /^-?\d+((\.|,)\d+)?$/,
											     url: /^(http(s?):\/\/)?(www\.)?[a-zA-Z0-9\.\-\_]+(\.[a-zA-Z]{2,3})+(\/[a-zA-Z0-9\_\-\s\.\/\?\%\#\&\=]*)?$/,
											     tel: /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/
									   };
				
				elementCollection = [];
				
				validFields       = [];
				cantBeBlank       = [];
				invalidFields     = [];
				
				constructor( form ) {
					this.form = form;
					this.collectFormElt();
					this.handleForm();
				}
				
				handleForm() {
				
					this.form.addEventListener('submit', (event) => {
						
						for (const elt of this.elementCollection) {
							if ( this.blankCheck(elt) === false && this.regexCheck(elt) === false ) {
								this.validFields.push(elt);
							}
						}
						
						console.log(this.elementCollection);
						console.log(this.validFields);
						console.log(this.cantBeBlank);
						console.log(this.invalidFields);
						
						event.preventDefault();
						
						this.validFields = [];
						this.cantBeBlank = [];
						this.invalidFields = [];
					});
					
				}
				
				collectFormElt() {
				
					for (const elt of FormValidation.eltHandled ) {
						
						if (this.form.querySelectorAll(elt).length > 0) {
						
							for (const child of this.form.querySelectorAll(elt)) {
								
								this.elementCollection.push(child);
								
							}
						
						}
						
					}

				}
				
				blankCheck(element) {
					
					if (element.value.trim().length === 0 && element.getAttribute('aria-required') === 'true') {
						this.cantBeBlank.push(element);
						return true;
					}
					return false;
					
				}
				
				regexCheck(element) {
				
					if (element.tagName === 'INPUT' && element.type != 'text') {
						if (element.value.trim().length > 0 ) {
							if (! element.value.match (FormValidation.usableRegex[element.type])) {
								this.invalidFields.push([element, 'regex']);
								console.log('invalid ' + element.type);
								return true;
							}
						}
					}
					return false;
				
				}
				
			}
			
			const contactForm = new FormValidation( document.querySelector('form') );
