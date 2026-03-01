# Houndsabout - Find Dog-Friendly Places

A web application for dog owners to discover places that welcome their dogs - restaurants, cafes, pubs, retail shops, hotels and more.

## Features

- **Search by town or city**: Type any UK town name to find dog-friendly places nearby
- **Search by postcode**: Enter a full or partial postcode (e.g. OX1, BS1 5TR) to search
- **Near Me / Location search**: Use browser geolocation with a configurable radius (1, 5, 10, 25, 50 miles)
- **Category filters**: Filter by restaurant, cafe, pub, retail, hotel, park, beach, attraction
- **Dog policy badges**: Each place shows whether dogs are welcome inside, outside, or fully
- **Amenity tags**: Water bowls, dog treats, and dog menu indicators
- **Place detail pages**: Full info including contact, address, directions link, and dog amenities
- **Star ratings**: 5-star rating display with review counts

## Tech Stack

- **Frontend**: React + TypeScript + Wouter routing + TanStack Query + shadcn/ui + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon) via Drizzle ORM
- **Build**: Vite

## Database Schema

### places
- id (varchar UUID, PK)
- name, address, town, postcode (text)
- category: restaurant | cafe | pub | retail | hotel | park | beach | attraction
- description, phone, website, imageUrl (text)
- dogPolicy: dogs_inside | dogs_outside | dogs_both
- waterBowls, dogTreats, dogMenu (boolean)
- latitude, longitude (real)
- rating (real), reviewCount (integer)

## API Routes

- `GET /api/places` - All places
- `GET /api/places/:id` - Single place by ID
- `GET /api/search?q=oxford` - Search by town/city name
- `GET /api/search?q=OX1` - Search by postcode
- `GET /api/search?lat=51.75&lon=-1.25&radius=5` - Near location (miles)
- All search routes support `&type=pub` etc. for category filtering

## Seed Data

15 dog-friendly places across Oxford, Swindon, Bath, Bristol, and Burford are seeded on startup if the database is empty.

## Pages

- `/` - Home/search page with hero search bar and results grid
- `/place/:id` - Place detail page with full info, contact, amenities
