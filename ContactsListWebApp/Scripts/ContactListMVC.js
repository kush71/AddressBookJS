function Contact(id, name, email, phone, group, picturePath) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.group = group;
    this.picturePath = picturePath;
}

Contact.prototype.toString = function () {
    return this.name + '';
}

/* Model */
function ContactListModel(items, groups) {
    this._items = items;
    this.max_id = this.getNextId();
    this._filteredItems = items;
	this._selectedIndex = -1;
	this._groups = ["All"].concat(groups);
	this._selectedGroupIndex = 0;

	this.itemAdded = new Event(this);
	this.itemRemoved = new Event(this);
	this.itemUpdated = new Event(this);
	/*this.selectedIndexChanged = new Event(this); */
}

ContactListModel.prototype = {
    getItems: function (searchText) {
        this._filteredItems = [];
        for (item in this._items) {
            if ((!this._selectedGroupIndex || this._items[item].group == this._groups[this._selectedGroupIndex])) {
                var res = false;
                if (searchText.length < 2) {
                    res = true;
                }
                else {
                    var searchUpper = searchText.toUpperCase();
                    var arr = this._items[item].name.split(' ', 3);
                    for (i in arr) {
                        if (arr[i].toUpperCase().indexOf(searchUpper) == 0) {
                            res = true;
                            break;
                        }
                    }
                }

                if (res) {
                    this._filteredItems.push(this._items[item]);
                }
            }
        }
        return [].concat(this._filteredItems);
	},

    /* //TODO: send AJAX request and only then on success add/update/delete the item in the list */
    /* on failure - display an error message */
	addItem: function (item) {
		this._items.push(item);
		this.itemAdded.notify({ item: item });
	},

	updateItem: function (item) {
	    this._items[this._selectedIndex] = item;
	    this.itemUpdated.notify({ index: this._selectedIndex, item: item });
	},

	removeItemAt: function (index) {
		var item;

		item = this._items[index];
		this._items.splice(index, 1);
		this.itemRemoved.notify({ item: item });
		if (index === this._selectedIndex) {
			this.setSelectedIndex(-1);
		}
	},

	getItem: function (index) {
	    if (index >= 0 && index <= this._items.length) {
	        return this._items[index];
	    }
	    else {
	        return null;
	    }
	},

	getSelectedIndex: function () {
		return this._selectedIndex;
	},

	setSelectedIndex: function (index) {
		var previousIndex;

		previousIndex = this._selectedIndex;
		this._selectedIndex = this.getItemIndex(this._filteredItems[index]);
		/* this.selectedIndexChanged.notify({ previous: previousIndex }); */
	},

	getItemIndex: function (lookupItem) {
        if (lookupItem != undefined)
	    for (i = 0; i < this._items.length; i++) {
	        if (this._items[i].id == lookupItem.id) {
	            return i;
	        }
	    }
	    return -1;
	},

	getNextId: function () {
	    var maxId = 0;
	    for (i in this.items) {
	        if (this.items[i].id > max) {
	            maxId = this.items[i].id;
	        }
	    }
	    return maxId + 1;
	},
	
	setSelectedGroupIndex: function (groupIndex) {
	    this._selectedGroupIndex = groupIndex;
	}
};

/* Observable */

function Event(sender) {
	this._sender = sender;
	this._observers = [];
}

Event.prototype = {
	attach: function (observer) {
		this._observers.push(observer);
	},

	remove: function (observer) {
		var index;
		for (index = 0; index < this._observers.length; index += 1) {
			if (this._observers[index] === observer) {
				this._observers.splice(index, 1);
			}
		}
	},

	notify: function (args) {
		var index;

		for (index = 0; index < this._observers.length; index += 1) {
			this._observers[index](this._sender, args);
		}
	}
};

/* View */
function ContactListView(model, elements) {
	this._model = model;
	this._elements = elements;

	this.listSelectionChanged = new Event(this);
	this.groupSelectionChanged = new Event(this);
	this.searchTextChanged = new Event(this);
	this.addButtonClicked = new Event(this);
	this.delButtonClicked = new Event(this);
	this.editButtonClicked = new Event(this);
	this.saveButtonClicked = new Event(this);
	this.discardButtonClicked = new Event(this);
	
	var _this = this;

	// attach model observers
	this._model.itemAdded.attach(function () {
		_this.rebuildList();
	});
	this._model.itemRemoved.attach(function () {
		_this.rebuildList();
	});

	this._model.itemUpdated.attach(function () {
		_this.rebuildList();
	});

	// attach observers to HTML controls
	this._elements.list.change(function (e) {
		_this.listSelectionChanged.notify({ index: e.target.selectedIndex });
	});

	this._elements.groupSelector.change(function (e) {
	    _this.groupSelectionChanged.notify({ index: e.target.selectedIndex });
	});

	this._elements.search.keyup(function () {
	    _this.searchTextChanged.notify();
	});

	this._elements.addButton.click(function () {
		_this.addButtonClicked.notify();
	});

	this._elements.delButton.click(function () {
		_this.delButtonClicked.notify();
	});
	
	this._elements.editButton.click(function () {
	    _this.editButtonClicked.notify();
	});

	this._elements.saveButton.click(function () {
	    _this.saveButtonClicked.notify();
	});

	this._elements.discardButton.click(function () {
	    _this.discardButtonClicked.notify();
	});
}

ContactListView.prototype = {
	show: function () {
		this.rebuildList();
	},

	rebuildList: function () {
		var list, items, key;

		list = this._elements.list;
		list.html('');

		items = this._model.getItems(this._elements.search.val());
		for (key in items){ 
			if (items.hasOwnProperty(key)) {
				list.append($('<option>' + items[key].name + '</option>'));
			}
		}
		this._model.setSelectedIndex(-1);
	},

	startEditMode: function () {
	    $(".contact-info-edit").removeAttr('disabled');
	    $(".contacts-select").attr('disabled', 'disabled');
	},

	endEditMode: function () {
	    $(".contact-info-edit").attr('disabled', 'disabled');
	    $(".contacts-select").removeAttr('disabled');
	},

	displaySelected: function (item) {
	    this._elements.contactId.val(item.id);
	    this._elements.name.val(item.name);
	    this._elements.email.val(item.email);
	    this._elements.phone.val(item.phone);
	    ////for (key in this._elements.contactGroup) {
	    ////    if (this._elements.contactGroup[key] == item.group) {
	    ////        this._elements.contactGroup.selectedIndex = key;
	    ////    }
	    ////}
	    this._elements.contactGroup.val(item.group);
	    if (item.picturePath) {
	        this._elements.picture.attr('src', './images/' + item.picturePath);
	    }
	    else if (item.id !== -1){
	        this._elements.picture.attr('src', './images/User-0.png');
	    }
	},

    getContactId: function () {
        return this._elements.contactId.val();
	},

	getContactName: function () {
	    return this._elements.name.val();
	},

	getContactEmail: function () {
	    return this._elements.email.val();
	},

	getContactPhone: function () {
	    return this._elements.phone.val();
	},

	getContactGroup: function () {
	    return this._elements.contactGroup.val();
	},

	getContactPicrure: function () {
	    return this._elements.picture.attr('src');
	},

	getSelectedGroupIndex: function () {
	    return this._elements.groupSelector[0].selectedIndex;
	}
};

/* Controller */
function ContactListController(model, view) {
	this._model = model;
	this._view = view;

	var _this = this;

	this._view.listSelectionChanged.attach(function (sender, args) {
	    _this.updateSelected(args.index);
	});

	this._view.groupSelectionChanged.attach(function (sender, args) {
	    _this._model.setSelectedGroupIndex(_this._view.getSelectedGroupIndex());
	    _this._view.rebuildList();
	    //_this.updateSelected(0);
	});

	this._view.searchTextChanged.attach(function (sender, args) {
	    _this._view.rebuildList();
	});

	

	this._view.addButtonClicked.attach(function () {
	    _this.updateSelected(-1);
	    _this.startEditing();
	});

	this._view.delButtonClicked.attach(function () {
		_this.delItem();
	});
	
	this._view.editButtonClicked.attach(function () {
	    _this.startEditing();
	});

	this._view.saveButtonClicked.attach(function () {
	    _this.saveItem();
	});

	this._view.discardButtonClicked.attach(function () {
	    _this._view.endEditMode();
	});
}

ContactListController.prototype = {
	startEditing: function () {
	        this._view.startEditMode();
	},

	saveItem: function () {
	    var item = new Contact(this._view.getContactId(),
            this._view.getContactName(),
            this._view.getContactEmail(),
            this._view.getContactPhone(),
            this._view.getContactGroup(),
            this._view.getContactPicrure()
            );

	    var index = this._model.getSelectedIndex();
	    if (index !== -1) { /* edit */
	        /*// TODO: store Updated entry */
	        if (item) {
	            this._model.updateItem(item);
	        }
	    }
	    else { /* add */
	        /*// TODO: store Added entry */
	        item.id = this._model.getNextId();
	        if (item) {
	            this._model.addItem(item);
	        }
	    }
	    this._view.endEditMode();
	},

	delItem: function () {
		var index;

		index = this._model.getSelectedIndex();
		if (index !== -1) {
		    this._model.removeItemAt(this._model.getSelectedIndex());
		    this.updateSelected(-1);
		}
		
	},

	updateSelected: function (index) {
		this._model.setSelectedIndex(index);
		var item = this._model.getItem(index);
		this._view.displaySelected(item? item : new Contact(-1, '', '', '', '', ''));
	}
};

$(function () {
    var model = new ContactListModel([
        {id: 1, name: 'Ivan', phone: '555-55-55', email: 'ivan@corporate.com', group: 'Friends', picturePath: "User-M-1.png" },
        {id: 2, name: 'Maria', phone: '333-35-35', email: 'maria@corporate.com', group: 'Colleagues', picturePath: "Cust-F-1.png" }],
        [ 'Friends', 'Colleagues']),
        view = new ContactListView(model, {
        	'list': $('#list'),
        	'addButton': $('#addBtn'),
        	'delButton': $('#delBtn'),
        	'editButton': $('#editBtn'),
        	'editForm': $('#contactForm'),
        	'contactId': $('#ContactId'),
        	'picture': $('#ContactPicture'),
        	'name': $('#ContactName'),
        	'email': $('#ContactEmail'),
        	'phone': $('#ContactPhone'),
        	'contactGroup': $('#ContactGroupDropdown'),
        	'saveButton': $('#saveBtn'),
        	'discardButton': $('#discardBtn'),
        	'search': $('#SearchText'),
        	'groupSelector': $('#GroupSelect')
        }),
        controller = new ContactListController(model, view);

	view.show();
});