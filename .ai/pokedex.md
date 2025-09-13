# Pokedex project

I want to create a mobile-first web application that works as a pokedex.

## Plan

- read all the features and requirements
- understand the requirements
- validate the tech stack suggested by the user
- add suggestion on the tech stack, if something is missing, or something has to be changed, this has to be done in chat, and you have to ask the user for feedback and confirmation
- after the stack is validated create a new file in the .ai folder: pokedex-infrastructure.md
- i want you to design all the infrastucture, but do it step by step, one component at a time, and validate with me every step before going to the next one
- write in the file the general infrastructure: frontend, backend, database, hosting
- not all of the parts are mandatory, please explain the pros and cons of each part, and validate with me the choice
- after the validation, rewrite the infrastructure and keep it updated and as a reference
  - design the frontend structure of the application
    - create a list of the pages and the components
    - create a list of the routes
    - create a list of the data that will be fetched from the API
    - create a list of the data that will be stored in the database
  - if needed, design the layout of a library of reusable UI components (such as cards, buttons etc.)
    - use shadcn ui components as base
    - create a list of the components
  - if needed, design the layout of the backend structure. If we will use React Router framework approach, it should already mixed in the frontend structure, but we can explicitate here the features
  - if needed, design the layout of the database structure
  - for the hosting, I was thinking to use AWS, if it´s ok, design:
    - a different application to create all the infrastructure, using an iac approach
    - design the infrastructure of the application, including the database, the backend, the frontend, the hosting
  - we will use github actions for the CI/CD pipeline
- after we have a complete infrastructure, we will move to the next steps

## Requirements

### Tech stack

This is the preferred tech stack:

- React
- React Router
- Tailwind CSS
- Shadcn UI
- TypeScript
- a database provider

### Frontend

- the frontend should be a SSR or SSG application for the best performance
- after the initial data fetch, the frontend should be a SPA application
- the frontend should be a mobile-first application
- the frontend should be a responsive application
- if possible, keep all the data layer on server side, so that no api key is exposed to the client

### UI

- use shadcn ui components as base
- create a library of reusable UI components (such as cards, buttons etc.)
- keep a consistent design system
- the colors should be based on the types of the pokemons, and choose a main color for the rest of the application

### Backend

- we can use the framewort feature of React Router to create a backend for the frontend
- the major part of the data are from the pokeapi.co API
- the additional features, like the box, squad, user should be managed by some BaaS (Backend as a Service) provider, possibly AWS, to keep it everything in one place

### Data

- the data will be fetched from the pokeapi.co API
- we can use the library for the node BE: https://github.com/PokeAPI/pokedex-promise-v2 or the library for the node FE: https://github.com/PokeAPI/pokeapi-js-wrapper
- the choice to use one or another is based on if we will use the Backend for frontend approach of React Router or not, please explain the pros and cons of each approach, and validate with me the choice
- the data not handled by the pokeapi.co API should be stored in a database, the lightest possible solution, propose something that can be easily managed by a BaaS provider and works well with the rest of the infrastructure

## Features

### Main menu

- there is a main menu in the mobile version at the bottom of the screen
- the main menu is always visible and sticky
- the main menu is composed by a center icon and 4 options on the sides, two on the left and two on the right
- the main menu has the following options:
  - Home: is the center icon
  - Your squad: is the second option from the left
  - Pokedex: is the first option on the left
  - User: is the latest option on the right
  - Generations: is the first option on the right
- on desktop version, the main menu is in a left sidebar, collapsible with a button

### Home page

#### Main pokemon

- your first pokemon on your squad is displayed in the center of the screen
  - the number is displayed in the right top corner
  - the name is displayed in the left bottom corner
  - the image is displayed in the center, slightly moved to the right
  - the type/s are displayed in the left top corner, in a vertical list of icons
  - the screen background is a gradient of the main type, the image of the poken is over a circle with a full color of the main type
  - there is a button to open the pokemon details page

#### Your squad

- Your remaining squad is displayed in a grid of maximum 5 pokemons
- the latest card, which is the 6th one if the squad is full, is a button to open the squad page
- Each pokemon is clickable and change the pokemon in the center of the screen
- Each pokemon has its own card
  - Name: is the name of the pokemon
  - Image: is a png image of the pokemn
  - Type/s: is the type/s of the pokemon
  - number in the national pokedex: is the number in the national pokedex
  - color of the card based on the main type
- The grid is responsive and adapts to the screen size
- the grid is sorted by the user's choice

### Your squad page

- the page is displayed when the user clicks on the squad button in the home page
- the page is composed by a grid of maximum 6 pokemons
- the grid is sorted by the user's choice
- the grid is responsive and adapts to the screen size
- each pokemon is clickable and open the pokemon details page
- each pokemon has its own card
  - Name: is the name of the pokemon
  - Image: is a png image of the pokemon
  - Type/s: is the type/s of the pokemon
  - number in the national pokedex: is the number in the national pokedex
  - color of the card based on the main type
- holding on a pokemon card, or clicking with the right mouse button, opens a context menu with the following options:
  - Remove from squad: removes the pokemon from the squad
  - View details: opens the pokemon details page
  - move up: moves the pokemon up in the squad
  - move down: moves the pokemon down in the squad
- under the grid the is a new section with another grid of maximum 6 pokemons
- the section is called "your latest pokemons"
- the section is sorted by the date of the latest pokemon added to your box
- the section is responsive and adapts to the screen size
- each pokemon is clickable and open the pokemon details page
- each pokemon has its own card
  - Name: is the name of the pokemon
  - Image: is a png image of the pokemon
  - Type/s: is the type/s of the pokemon
  - number in the national pokedex: is the number in the national pokedex
  - color of the card based on the main type
- holding on a pokemon card, or clicking with the right mouse button, opens a context menu with the following options:
  - add to squad: adds the pokemon to the squad, if the squad is full, a modal dialog is displayed with a list of the pokemons in the squad, selecting one will remove it from the squad and add the new pokemon to the squad
  - View details: opens the pokemon details page
- under the "your latest pokemons" section, there is a button to open the "your box" page

### Your box page

- the page is displayed when the user clicks on the box button in the home page
- the page is composed by a grid of cards
- the page has a scroll bar to scroll through the cards
- after a number of cards, there is a button to load more cards
- each card is a pokemon
- each card has the following information:
  - Name: is the name of the pokemon
  - Image: is a png image of the pokemon
  - Type/s: is the type/s of the pokemon
  - number in the national pokedex: is the number in the national pokedex
  - color of the card based on the main type
- holding on a pokemon card, or clicking with the right mouse button, opens a context menu with the following options:
  - add to squad: adds the pokemon to the squad, if the squad is full, a modal dialog is displayed with a list of the pokemons in the squad, selecting one will remove it from the squad and add the new pokemon to the squad
  - View details: opens the pokemon details page
  - free the pokemon: removes the pokemon from the box, if the pokemon is in the squad, it is removed from the squad
- at the start of the page, there is a search bar to search for a pokemon, and on the right of the search bar, there is a button to filter the search
- the filter button opens a modal dialog with the following options:
  - type: filters the pokemons by type/s
  - generation: filters the pokemons by generation/s
  - sort by name: sorts the pokemons by name
  - sort by number: sorts the pokemons by number
  - sort by type: sorts the pokemons by type/s
  - sort by generation: sorts the pokemons by generation/s
  - sort by stats: sorts the pokemons by stats (total of all stats)

### Pokedex page

- the page is displayed when the user clicks on the pokedex button in the home page
- the page is composed by a grid of cards
- the page has a scroll bar to scroll through the cards
- after a number of cards, there is a button to load more cards
- each card is a pokemon
- each card has the following information:
  - Name: is the name of the pokemon
  - Image: is a png image of the pokemon
  - Type/s: is the type/s of the pokemon
  - number in the national pokedex: is the number in the national pokedex
  - color of the card based on the main type
- holding on a pokemon card, or clicking with the right mouse button, opens a context menu with the following options:
  - add to squad: adds the pokemon to the squad, if the squad is full, a modal dialog is displayed with a list of the pokemons in the squad, selecting one will remove it from the squad and add the new pokemon to the squad
  - View details: opens the pokemon details page
  - catch the pokemon: adds the pokemon to the box
- at the start of the page, there is a search bar to search for a pokemon, and on the right of the search bar, there is a button to filter the search
- the filter button opens a modal dialog with the following options:
  - type: filters the pokemons by type/s
  - generation: filters the pokemons by generation/s
  - sort by name: sorts the pokemons by name
  - sort by number: sorts the pokemons by number
  - sort by type: sorts the pokemons by type/s
  - sort by generation: sorts the pokemons by generation/s
  - sort by stats: sorts the pokemons by stats (total of all stats)

#### Not full pokedex

- The pokedex starts with no pokemon visibile
- all the cards are grayed out:
  - the number in the national pokedex is visible as always
  - the image has a black filter to hide the colors, only a silhouette is visible
  - the name is missing
  - the type/s are a list of black icons
- when the user clicks on a card, the card, it show in the center of the page the silhouette of the pokemon, with the number and a two buttons, one to catch the pokemon and one to "see the pokemon"
- when the user clicks on the catch button, the pokemon is added to the box
- when the user clicks on the "see the pokemon" button, the pokemon details page is displayed, and in the pokedex is now visible

### Pokemon details page

- the page is displayed when the user clicks on the details button in the home page
- the name is in the left top corner
- the image is in the center of the page, slightly moved to the right
- the type/s are displayed in the left top corner, in a vertical list of icons
- the screen background is a gradient of the main type, the image of the poken is over a circle with a full color of the main type
- there are two buttons in the right top corner:
  - there is a button to add the pokemon to the squad
  - there is a button to catch the pokemon and send it to the box
- there is a section in white under the image, with a series of tabs:
  - "about"
  - "stats"
  - "evolution"
  - "moves"
- is possible to "expand" the section to see more information, on mobile with a swipe, on desktop scrolling down
- when expanded, the image is moved to the right and reduced in size, the name is on the left, reducing its size, the types are hidden, and so the number

#### About tab

- the tab is composed by a series of information:
  - description
  - a box raised with
    - height
    - weight
  - a box raised with gender ratio
    - male and female are displayed with its symbol and a percentage

#### Stats tab

- the tab is composed by a series of information:
  - stats are displayed in a list of bars, one for each stat
  - the bars are colored based on the stat
  - the bars are labeled with the stat name and the value
  - the bars are responsive and adapts to the screen size
  - the total of all stats is displayed in the right bottom corner

#### Evolution tab

TBD

#### Moves tab

TBD

#### Locations tab

TBD

### User page

TBD

### Generations page

TBD

### Settings page

TBD