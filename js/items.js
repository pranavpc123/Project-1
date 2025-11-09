// Item data management
class ItemManager {
    static getItems() {
        const items = localStorage.getItem(CONFIG.STORAGE_KEYS.ITEMS);
        return items ? JSON.parse(items) : [];
    }

    static saveItems(items) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.ITEMS, JSON.stringify(items));
    }

    static addItem(item) {
        const items = this.getItems();
        
        // Check order limit (1000 orders)
        if (items.length >= 1000) {
            throw new Error('Maximum limit of 1000 orders reached. Please delete some orders before adding new ones.');
        }
        
        const newItem = {
            id: Date.now().toString(),
            name: item.name,
            description: item.description || '',
            price: parseFloat(item.price),
            category: item.category,
            image: item.image || this.getDefaultImage(item.category)
        };
        items.push(newItem);
        this.saveItems(items);
        return newItem;
    }

    static updateItem(id, updatedItem) {
        const items = this.getItems();
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = {
                ...items[index],
                ...updatedItem,
                price: parseFloat(updatedItem.price),
                image: updatedItem.image || items[index].image || this.getDefaultImage(updatedItem.category || items[index].category)
            };
            this.saveItems(items);
            return items[index];
        }
        return null;
    }

    static getDefaultImage(category) {
        // Open source food images from Wikimedia Commons
        const foodImages = [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Appam_with_stew.jpg/400px-Appam_with_stew.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Puttu_kadala.jpg/400px-Puttu_kadala.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Dosa_%281%29.jpg/400px-Dosa_%281%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Idli_with_Vada_and_Sambar.jpg/400px-Idli_with_Vada_and_Sambar.jpg'
        ];
        const snackImages = [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Banana_chips.jpg/400px-Banana_chips.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Murukku.jpg/400px-Murukku.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Achappam.jpg/400px-Achappam.jpg'
        ];
        const images = category === 'snacks' ? snackImages : foodImages;
        return images[Math.floor(Math.random() * images.length)];
    }

    static deleteItem(id) {
        const items = this.getItems();
        const filteredItems = items.filter(item => item.id !== id);
        this.saveItems(filteredItems);
        return filteredItems;
    }

    static getItemById(id) {
        const items = this.getItems();
        return items.find(item => item.id === id);
    }

    static initializeDefaultItems() {
        const items = this.getItems();
        if (items.length === 0) {
            const defaultItems = [
                {
                    id: '1',
                    name: 'Appam',
                    description: 'Soft and fluffy rice pancakes',
                    price: 45,
                    category: 'foods',
                    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Appam_with_stew.jpg/400px-Appam_with_stew.jpg'
                },
                {
                    id: '2',
                    name: 'Puttu',
                    description: 'Steamed rice cake with coconut',
                    price: 50,
                    category: 'foods',
                    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Puttu_kadala.jpg/400px-Puttu_kadala.jpg'
                },
                {
                    id: '3',
                    name: 'Dosa',
                    description: 'Crispy fermented crepe',
                    price: 40,
                    category: 'foods',
                    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Dosa_%281%29.jpg/400px-Dosa_%281%29.jpg'
                },
                {
                    id: '4',
                    name: 'Idli',
                    description: 'Steamed rice cakes with sambar',
                    price: 35,
                    category: 'foods',
                    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Idli_with_Vada_and_Sambar.jpg/400px-Idli_with_Vada_and_Sambar.jpg'
                },
                {
                    id: '5',
                    name: 'Banana Chips',
                    description: 'Crispy fried banana chips',
                    price: 60,
                    category: 'snacks',
                    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Banana_chips.jpg/400px-Banana_chips.jpg'
                },
                {
                    id: '6',
                    name: 'Murukku',
                    description: 'Crunchy spiral-shaped snack',
                    price: 55,
                    category: 'snacks',
                    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Murukku.jpg/400px-Murukku.jpg'
                },
                {
                    id: '7',
                    name: 'Achappam',
                    description: 'Crispy flower-shaped snack',
                    price: 50,
                    category: 'snacks',
                    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Achappam.jpg/400px-Achappam.jpg'
                },
                {
                    id: '8',
                    name: 'Vegetable Stew',
                    description: 'Coconut milk curry',
                    price: 65,
                    category: 'foods',
                    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Vegetable_stew.jpg/400px-Vegetable_stew.jpg'
                }
            ];
            this.saveItems(defaultItems);
        }
    }
}

// Initialize default items when the script loads
ItemManager.initializeDefaultItems();

