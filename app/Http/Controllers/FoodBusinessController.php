<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class FoodBusinessController extends Controller
{
    /**
     * @var list<string>
     */
    private const BUSINESS_NAMES = [
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

    /**
     * @var array<string, string>
     */
    private const BUSINESS_IMAGES = [
        "DA'TONI Ristorante Italiano" => 'https://lh3.googleusercontent.com/grass-cs/AABkmLeEflSKZhe9-hIkiX9a1x4vVVwSGDcsmSoLqm3zcHUusz9Vt5DyLmFXM1BDyq4AVvn0_vS6wVVgzVVrKbmKi5hdP_OMP7wacWElj4gfFsapeLl7QmEg3-0cMpzHZmhXBiM-RxYl=w408-h306-k-no',
        "McDonald's" => 'https://lh3.googleusercontent.com/grass-cs/AABkmLeotoF9EstGAkPvHDrgTii8TJE7E6pO3OH_z2ISF6ixs03s7bEqcNyXz7IhBlH7xz3_5rKsuFuUx6noJEVzlwynjlqFJy38vqVoIvVqad75crhowB9ed-8dVYAfYNIpuFmQ1QR9Cvoa43k=w408-h306-k-no',
        'Sugoi Ramen Abuyog Leyte' => 'https://lh3.googleusercontent.com/grass-cs/AABkmLeYMU-1A1fJNCsxJ75HQDrRBZC1J6t9d461ivqOgFkF_avVgYXcdpAF5yLRBdmt8quwG31fQngQoZitLmCLmCdvnObZipmsZKUxZYhA_EEGXc994TiNT2i9pHTc-iH5EqfGAB8cRA=w408-h544-k-no',
        'JM Food Corner' => 'https://lh3.googleusercontent.com/grass-cs/AABkmLcqVXuwCBahTcg9YmQVEHN7Dm41vNhg_zg0ZebGABBmOOvrhXJwMkuqFRRzV6BTfTQ1P8xDfU0675Dp3Qv8kvW3dzPTnErxglBTMyRY10LEy2JLwp2w3rtfWOsjN_2JFStPgXv9nA=w408-h321-k-no',
        'Neychurlava Foodhouse' => 'https://lh3.googleusercontent.com/grass-cs/AABkmLefNbbVaRS8ORHP_OnKHykDfC5XhOz21toiRBpdAxb4VPF74jM9Gm8EptpBLT7-s2dzxVvvnhBzUSklR06I4G0iIjkjCzqMvC2Z_8ev36nRHUMHcD18G9IdiIPOi2d6A0KvzkC-fQ=w408-h724-k-no',
        'Cafe Jaime, Kapehan sa Bukid' => 'https://lh3.googleusercontent.com/grass-cs/AABkmLepFwRcKPqvD0ISOtXISwlhLQ4kfW0dsrDGSy4t73TIecizCgBgOFtWng1Eq7V7mKf9CA93yaglfHZ78M09-MyIZ_P542Z46mENSXTLm4QYlcAdADk7Jr2oH5eSbxX7TjDM1Kc=w408-h544-k-no',
        'Andes Cafe' => 'https://lh3.googleusercontent.com/grass-cs/AABkmLdam-Snn8805yaUmdrZ9tMW4Gf8xNwFVLux1s-Er8brTkAh0DSXMLgdfowVn-9TdFAW3HY812JKDwDbJU-4kZ2hpdePt8aUpDHtjF8qFD3JL8gRFR8blFECftTC1X3M3AJY2UDHrw=w408-h306-k-no',
        'Silog House' => 'https://lh3.googleusercontent.com/grass-cs/AABkmLe7_Cd4umWxK6C3i5QDlBxkiY7vbGwvMc4pI2f6qHGwx3Fie7hR81qRuf7MWS-th5ngH3AFvFoCmOUyz75EgpwDeTklLbbeVFJoBa22fZ9fKcTIV08eoNw-BTbBm2ap4iI5oesa=w408-h725-k-no',
        'Crispy King' => 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=ljkTakieLZe0P2T0mpZISA&cb_client=search.gws-prod.grass&w=408&h=240&yaw=220.85814&pitch=5.4856405&thumbfov=100',
        "Todoc's Special Native Delicacies" => 'https://scontent.fceb6-3.fna.fbcdn.net/v/t39.30808-1/425701913_840490438097870_6967222133736924682_n.jpg?stp=dst-jpg_tt6&cstp=mx951x960&ctp=s720x720&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=3ab345&_nc_ohc=TEGzDSdkDgsQ7kNvwHMGFgG&_nc_oc=Ado10iNJNQFe8x0YvaDGME_vTpST5WFW24M0Tt4TQI1uGMNhrvq8c_xkbi54omhEhlkT0hG_NPWNVaxde-xcJJTz&_nc_zt=24&_nc_ht=scontent.fceb6-3.fna&_nc_gid=7tAYGeWUvTwI39-UGtzLUw&_nc_ss=7b20f&oh=00_AQP0N8eepNBRDhksQFwdm_jrYkQf912DSxoSeZMPkF_u0Q&oe=6AE52807',
        'Honeybee Bakeshop' => 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=UIO8PDbh-cXX3z2csW15Hw&cb_client=search.gws-prod.grass&w=408&h=240&yaw=92.5116&pitch=0&thumbfov=100',
        "Batchow's Shawarma" => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKVf-rswX3HRXQqoP2y3-pqJO-Zaq4A_YGI_L6QoNAWOLEXbeb9PmEDRrB&s=10',
        "Lola Daday's Garden Café" => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK5lmee2M0J1hDc5kbcf9X7fClHgrJOaTLSNOWzTJG5S4cTXG1BdQBcLw&s=10',
        "Big Daddy's Cup" => 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=ijj4H-dgwelxsh0Xw2rhwg&cb_client=search.gws-prod.grass&w=408&h=240&yaw=295.38773&pitch=0&thumbfov=100',
        'ZACHY Food Hub' => 'https://lh3.googleusercontent.com/grass-cs/AABkmLenq-tO-esPszaqiIp8jdp6Bwb5ludTX2d_3sSYtq78WCVVJ2N87vkrPV5j6iU6AqTyS__Ie1a0hnjZTHqoLADE_bWBBgcKyGMIJPS1T6WXYZCq4KY07bJaclEzN33J88QPSEbTLA=w408-h306-k-no',
        'S and E Delights' => 'https://lh3.googleusercontent.com/grass-cs/AABkmLdedRA803oMtwMHXYYhUhQoFCYUVyxNz0Et9zcfzumOzkAUpz_5covqb-LMrrGauxsIvdvhwukIP2LAHnpHAlwUJSuAgr5xOZtSoFBnFaJRJdtcWjD23jXy_mme7Bttls89RxfAb8Yed1ug=w408-h544-k-no',
        "Resto '62" => 'https://lh3.googleusercontent.com/grass-cs/AABkmLczzbI1WbfKLB-sq3T6wZMAdicEwXF5T6wfzOO2N5HQ0ehuO1T6Nv8rgI8LprUfSiQIlGSXN0wyqGZcKLD2VjQOyZ854bbrNMH4xb8WyJnFYGlcnWv3LFfPo0FZT3jvgppBsgFk=w408-h408-k-no',
        "Royen's Suman Latik" => 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=L4Du1n2SkNZcS-AXnnX__Q&cb_client=search.gws-prod.grass&w=408&h=240&yaw=62.107494&pitch=0&thumbfov=100',
        "Kai's HaloHalo" => 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QICSzvfaJwKoZQVnS3oQ-jtmlGJBLNTa2htXT2o2Apey7GCg8nC2Lih7hAznXvbxGzdgXV8nA6DKFr6wo531EqdNgWmPRma_BD2hm7wzP9F8ZauXwd5DUwUlPxhqSukrJa94Bd2O8SQWSm=s680-w680-h510-rw',
        "Gelan's Grill" => 'https://lh3.googleusercontent.com/grass-cs/AABkmLfYJMhxreIipVyNpbDgym5WSSLoI8LWBaEEBb_v7lEfiAwClcMYodh-438MwdLBoGvno8lx583-za8vVJx8Fj0pJYE7hhFvfL8ojsPwmVNu1FJIj6SxcOrji0-nrUCrQDtwYQu20zdmOkeZ=w408-h544-k-no',
        "Luchie's Tasty Bites Pizza" => 'https://scontent.fceb6-5.fna.fbcdn.net/v/t39.30808-6/514314695_122105476448927302_6166764282199023480_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1080x1056&ctp=s960x960&_nc_cat=108&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeF44kk5lhqvWTUJrxMWG2dfzPCWLUZUGc_M8JYtRlQZz9KDUpKxqXz0iMHeVTdk5uqkdYwbigIZw9ImZ--ubhb7&_nc_ohc=xUTHh8aIelMQ7kNvwGl2qwY&_nc_oc=AdrT0fcUlgPL0Bd0FtVszudIN95gKJGf9pq0Dl_20d6BP9hnrH7TUJFiX0Sk65IMVSEhq4NS_oIGDZ5eTGbSiwxJ&_nc_zt=23&_nc_ht=scontent.fceb6-5.fna&_nc_gid=DLR3Ehv5-LrnuwUFS6saSg&_nc_ss=7b2a8&oh=00_AQNE5UIJC3EU1Z4YVomZRyj5z4jPG3iRHTqVSLRwSxY1vw&oe=6AE52E93',
        'ZESTY BURGER BITES' => 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=YUUfKL2FUXMZ0Xi5HNLXpw&cb_client=search.gws-prod.grass&w=408&h=240&yaw=199.20042&pitch=0&thumbfov=100',
        'American Winghouse' => 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=ijj4H-dgwelxsh0Xw2rhwg&cb_client=search.gws-prod.grass&w=408&h=240&yaw=311.22617&pitch=0&thumbfov=100',
    ];

    /**
     * @return array{
     *     businesses: list<array{
     *         name: string,
     *         category: string,
     *         address: null,
     *         rating: null,
     *         review_count: null,
     *         image_url: string|null,
     *         verification_status: string,
     *         google_maps_url: string
     *     }>,
     *     foods: list<array{
     *         name: string,
     *         description: string,
     *         provenance: string,
     *         verification_status: string,
     *         sources: list<array{label: string, url: string}>,
     *         image: array{
     *             url: string,
     *             alt: string,
     *             credit: string,
     *             source_url: string,
     *             license_url: string,
     *             license_label: string
     *         }|null
     *     }>
     * }
     */
    private function directoryData(): array
    {
        $businesses = array_map(
            static fn (string $name): array => [
                'name' => $name,
                'category' => 'Other Food Businesses',
                'address' => null,
                'rating' => null,
                'review_count' => null,
                'image_url' => self::BUSINESS_IMAGES[$name] ?? null,
                'verification_status' => 'Needs verification',
                'google_maps_url' => 'https://www.google.com/maps/search/?'.http_build_query([
                    'api' => 1,
                    'query' => "{$name}, Abuyog, Leyte",
                ]),
            ],
            self::BUSINESS_NAMES,
        );

        return [
            'businesses' => $businesses,
            'foods' => [
                [
                    'name' => 'Moron',
                    'description' => 'A glutinous-rice cake similar to suman and associated with Waray communities in Eastern Visayas. Its local Abuyog history has not been established.',
                    'provenance' => 'Regional association; not verified as originating in Abuyog.',
                    'verification_status' => 'Partially verified',
                    'sources' => [
                        [
                            'label' => 'Morón (food) reference',
                            'url' => 'https://en.wikipedia.org/wiki/Moron_(food)',
                        ],
                        [
                            'label' => 'Suman (food) reference',
                            'url' => 'https://en.wikipedia.org/wiki/Suman_(food)',
                        ],
                    ],
                    'image' => [
                        'url' => 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Chocolate_Moron.jpg/500px-Chocolate_Moron.jpg',
                        'alt' => 'Chocolate moron, a glutinous-rice cake wrapped in leaves',
                        'credit' => 'Jojit fb',
                        'source_url' => 'https://commons.wikimedia.org/wiki/File:Chocolate_Moron.jpg',
                        'license_url' => 'https://creativecommons.org/licenses/by-sa/4.0/',
                        'license_label' => 'CC BY-SA 4.0',
                    ],
                ],
                [
                    'name' => 'Suman',
                    'description' => 'A Filipino rice cake commonly made with glutinous rice and cooked in coconut milk, often wrapped in leaves. Recipes vary by locality.',
                    'provenance' => 'Filipino-wide food; no specific Abuyog origin is claimed.',
                    'verification_status' => 'Partially verified',
                    'sources' => [
                        [
                            'label' => 'Suman (food) reference',
                            'url' => 'https://en.wikipedia.org/wiki/Suman_(food)',
                        ],
                    ],
                    'image' => [
                        'url' => 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Suman_or_Rice_cake.jpg/960px-Suman_or_Rice_cake.jpg',
                        'alt' => 'Suman rice cakes wrapped in banana leaves',
                        'credit' => 'Ej Afable',
                        'source_url' => 'https://commons.wikimedia.org/wiki/File:Suman_or_Rice_cake.jpg',
                        'license_url' => 'https://creativecommons.org/licenses/by-sa/4.0/',
                        'license_label' => 'CC BY-SA 4.0',
                    ],
                ],
                [
                    'name' => 'Binagol',
                    'description' => 'A sweet steamed delicacy associated with Leyte, particularly Dagami, traditionally placed in a coconut shell and wrapped in banana leaves. Its exact local preparation can vary.',
                    'provenance' => 'Leyte association, particularly Dagami; no specific Abuyog origin is claimed.',
                    'verification_status' => 'Partially verified',
                    'sources' => [
                        [
                            'label' => 'Binagol reference',
                            'url' => 'https://en.wikipedia.org/wiki/Binagol',
                        ],
                        [
                            'label' => 'Leyte travel and food guide',
                            'url' => 'https://outoftownblog.com/leyte-bucket-list-top-15-things-to-do-in-leyte/',
                        ],
                    ],
                    'image' => [
                        'url' => 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Pasalubong_from_Tacloban.JPG/960px-Pasalubong_from_Tacloban.JPG',
                        'alt' => 'Tacloban pasalubong assortment, captioned by a Leyte travel guide as including Binagol, Moron, and Sagmani',
                        'credit' => 'JinJian',
                        'source_url' => 'https://commons.wikimedia.org/wiki/File:Pasalubong_from_Tacloban.JPG',
                        'license_url' => 'https://creativecommons.org/licenses/by-sa/3.0/',
                        'license_label' => 'CC BY-SA 3.0',
                    ],
                ],
                [
                    'name' => 'Sagmani',
                    'description' => 'A Leyte food guide describes sagmani as a banana-leaf-wrapped delicacy made with taro, cassava, coconut milk, and peanuts. Confirmation from a local or primary source is still needed.',
                    'provenance' => 'Reported as a Leyte delicacy by a secondary travel source; not verified as an Abuyog specialty.',
                    'verification_status' => 'Partially verified',
                    'sources' => [
                        [
                            'label' => 'Leyte travel and food guide',
                            'url' => 'https://outoftownblog.com/leyte-bucket-list-top-15-things-to-do-in-leyte/',
                        ],
                    ],
                    'image' => [
                        'url' => 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Pasalubong_from_Tacloban.JPG/960px-Pasalubong_from_Tacloban.JPG',
                        'alt' => 'Tacloban pasalubong assortment; its Commons description identifies Sagmani and Moron',
                        'credit' => 'JinJian',
                        'source_url' => 'https://commons.wikimedia.org/wiki/File:Pasalubong_from_Tacloban.JPG',
                        'license_url' => 'https://creativecommons.org/licenses/by-sa/3.0/',
                        'license_label' => 'CC BY-SA 3.0',
                    ],
                ],
                [
                    'name' => 'Roscas',
                    'description' => 'A baked Leyte delicacy associated with Barugo. A cited travel guide describes a recipe with flour, sugar, eggs, shortening, and anise, but spells the locality “Garugo.”',
                    'provenance' => 'Barugo, Leyte association; no specific Abuyog origin is claimed.',
                    'verification_status' => 'Partially verified',
                    'sources' => [
                        [
                            'label' => 'Leyte travel and food guide',
                            'url' => 'https://outoftownblog.com/leyte-bucket-list-top-15-things-to-do-in-leyte/',
                        ],
                    ],
                    'image' => [
                        'url' => 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Roscas_%28Leyte_cuisine%29.jpg/500px-Roscas_%28Leyte_cuisine%29.jpg',
                        'alt' => 'Two traditional Leyte roscas presented together on a plate',
                        'credit' => 'Bagoto',
                        'source_url' => 'https://commons.wikimedia.org/wiki/File:Roscas_(Leyte_cuisine).jpg',
                        'license_url' => 'https://creativecommons.org/licenses/by-sa/4.0/',
                        'license_label' => 'CC BY-SA 4.0',
                    ],
                ],
                [
                    'name' => 'Budbud',
                    'description' => 'Budbud is a regional name used for varieties of suman, a Filipino sticky-rice cake. Abuyog-specific ingredients and preparation have not been verified.',
                    'provenance' => 'Regional food term; local variation is not documented here.',
                    'verification_status' => 'Partially verified',
                    'sources' => [
                        [
                            'label' => 'Suman (food) reference',
                            'url' => 'https://en.wikipedia.org/wiki/Suman_(food)',
                        ],
                    ],
                    'image' => [
                        'url' => 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Suman_or_Rice_cake.jpg/960px-Suman_or_Rice_cake.jpg',
                        'alt' => 'Suman or budbud-style rice cakes wrapped in banana leaves',
                        'credit' => 'Ej Afable',
                        'source_url' => 'https://commons.wikimedia.org/wiki/File:Suman_or_Rice_cake.jpg',
                        'license_url' => 'https://creativecommons.org/licenses/by-sa/4.0/',
                        'license_label' => 'CC BY-SA 4.0',
                    ],
                ],
                [
                    'name' => 'Bibingka',
                    'description' => 'A Filipino rice cake with many regional preparations. No Leyte- or Abuyog-specific recipe or origin claim is made here.',
                    'provenance' => 'Filipino-wide food; local variation needs a local source.',
                    'verification_status' => 'Partially verified',
                    'sources' => [
                        [
                            'label' => 'Bibingka reference',
                            'url' => 'https://en.wikipedia.org/wiki/Bibingka',
                        ],
                    ],
                    'image' => [
                        'url' => 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/BIBINGKA_rice_cakes.jpg/960px-BIBINGKA_rice_cakes.jpg',
                        'alt' => 'Bibingka rice cakes baked on banana leaves in Cebu',
                        'credit' => 'whologwhy',
                        'source_url' => 'https://commons.wikimedia.org/wiki/File:BIBINGKA_rice_cakes.jpg',
                        'license_url' => 'https://creativecommons.org/licenses/by/2.0/',
                        'license_label' => 'CC BY 2.0',
                    ],
                ],
            ],
        ];
    }

    public function index(): Response
    {
        return Inertia::render('food/index', $this->directoryData());
    }
}
