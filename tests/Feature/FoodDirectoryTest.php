<?php

use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;

test('the local foods directory lists only businesses with supplied images', function () {
    $expectedImageBusinessNames = [
        "DA'TONI Ristorante Italiano",
        "McDonald's",
        'Sugoi Ramen Abuyog Leyte',
        'JM Food Corner',
        'Neychurlava Foodhouse',
        'Cafe Jaime, Kapehan sa Bukid',
        'Andes Cafe',
        'Silog House',
        'Crispy King',
        "Todoc's Special Native Delicacies",
        'Honeybee Bakeshop',
        "Batchow's Shawarma",
        "Lola Daday's Garden Café",
        "Big Daddy's Cup",
        'ZACHY Food Hub',
        'S and E Delights',
        "Resto '62",
        "Royen's Suman Latik",
        "Kai's HaloHalo",
        "Gelan's Grill",
        "Luchie's Tasty Bites Pizza",
        'ZESTY BURGER BITES',
        'American Winghouse',
    ];
    $removedNames = [
        "Edang's Barbecue House",
        'RREMS Food Hub',
        'Sevyn Brew',
        "Nanay's Comfort Food",
        'BossMakoy Coffee',
        'Amakan ni JevJev',
        "Mamita's Diner Cafe",
        "Zianna's Sweet Treats",
        "Jeryana's Kitchen",
        "Ajojo's",
    ];

    $this->get('/local-foods')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('food/index')
            ->has('businesses', 23)
            ->where('businesses', fn (Collection $businesses): bool => $businesses->pluck('name')->all() === $expectedImageBusinessNames
                && $businesses->every(fn (array $business): bool => $business['verification_status'] === 'Needs verification'
                    && $business['category'] === 'Other Food Businesses'
                    && str_starts_with($business['google_maps_url'], 'https://www.google.com/maps/')
                    && $business['address'] === null
                    && $business['rating'] === null
                    && $business['review_count'] === null
                    && $business['image_url'] !== null)
                && $businesses->pluck('name')->intersect($removedNames)->isEmpty())
            ->has('foods', 7)
            ->where('foods.0.name', 'Moron')
            ->where('foods.6.name', 'Bibingka')
            ->where('foods', function (Collection $foods): bool {
                $foodsByName = $foods->keyBy('name');

                return $foodsByName->get('Moron')['image']['credit'] === 'Jojit fb'
                    && $foodsByName->get('Suman')['image']['source_url'] === 'https://commons.wikimedia.org/wiki/File:Suman_or_Rice_cake.jpg'
                    && $foodsByName->get('Binagol')['image']['source_url'] === 'https://commons.wikimedia.org/wiki/File:Pasalubong_from_Tacloban.JPG'
                    && $foodsByName->get('Sagmani')['image']['source_url'] === 'https://commons.wikimedia.org/wiki/File:Pasalubong_from_Tacloban.JPG'
                    && $foodsByName->get('Roscas')['image']['source_url'] === 'https://commons.wikimedia.org/wiki/File:Roscas_(Leyte_cuisine).jpg'
                    && $foodsByName->get('Budbud')['image']['credit'] === 'Ej Afable'
                    && $foodsByName->get('Bibingka')['image']['license_label'] === 'CC BY 2.0';
            })
            ->where('businesses.0.image_url', 'https://lh3.googleusercontent.com/grass-cs/AABkmLeEflSKZhe9-hIkiX9a1x4vVVwSGDcsmSoLqm3zcHUusz9Vt5DyLmFXM1BDyq4AVvn0_vS6wVVgzVVrKbmKi5hdP_OMP7wacWElj4gfFsapeLl7QmEg3-0cMpzHZmhXBiM-RxYl=w408-h306-k-no')
            ->where('businesses.9.image_url', 'https://scontent.fceb6-3.fna.fbcdn.net/v/t39.30808-1/425701913_840490438097870_6967222133736924682_n.jpg?stp=dst-jpg_tt6&cstp=mx951x960&ctp=s720x720&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=3ab345&_nc_ohc=TEGzDSdkDgsQ7kNvwHMGFgG&_nc_oc=Ado10iNJNQFe8x0YvaDGME_vTpST5WFW24M0Tt4TQI1uGMNhrvq8c_xkbi54omhEhlkT0hG_NPWNVaxde-xcJJTz&_nc_zt=24&_nc_ht=scontent.fceb6-3.fna&_nc_gid=7tAYGeWUvTwI39-UGtzLUw&_nc_ss=7b20f&oh=00_AQP0N8eepNBRDhksQFwdm_jrYkQf912DSxoSeZMPkF_u0Q&oe=6AE52807'));
});
