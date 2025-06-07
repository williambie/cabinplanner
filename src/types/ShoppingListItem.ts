export interface ShoppingListItem {
    id: string;
    itemName: string;
    isBought: boolean;
    addedBy: {
        username: string;
    };
}
