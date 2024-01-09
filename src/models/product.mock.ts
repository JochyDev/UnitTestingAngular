import { faker } from '@faker-js/faker';

import { Product } from './product.model';

export const geneateOneProduct = (): Product => {

    return {
        id: faker.string.uuid(),
        title: faker.commerce.productName(),
        price: parseInt(faker.commerce.price(), 10),
        description: faker.commerce.productDescription(),
        category: {
            id: faker.number.int(),
            name: faker.commerce.department()
        },
        images: [faker.image.url(), faker.image.url()]
    }
}

export const genarateManyProducts = ( size = 10): Product[] => {
    const products: Product[] = [];
    for( let index = 0; index < size; index++){
        products.push(geneateOneProduct());
    }

    return [...products]
}