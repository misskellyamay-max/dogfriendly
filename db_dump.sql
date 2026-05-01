--
-- PostgreSQL database dump
--

\restrict UT8JGkvCG5FrpOqgS7FaUxYypWpSu8d2oUOaiufuWBAjAr5B2l1rnTeaFfOVLC3

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: places; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.places (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    town text NOT NULL,
    postcode text NOT NULL,
    category text[] NOT NULL,
    description text NOT NULL,
    phone text,
    website text,
    image_url text,
    dog_policy text NOT NULL,
    water_bowls boolean DEFAULT false,
    dog_treats boolean DEFAULT false,
    dog_menu boolean DEFAULT false,
    latitude real NOT NULL,
    longitude real NOT NULL,
    rating real DEFAULT 4 NOT NULL,
    review_count integer DEFAULT 0 NOT NULL,
    opening_hours jsonb,
    address2 text,
    verified boolean DEFAULT false NOT NULL,
    verified_at timestamp without time zone,
    important_info text,
    photos text[],
    hotel_info text,
    dog_charge boolean DEFAULT false,
    max_dogs integer,
    dog_charge_amount real
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


--
-- Data for Name: places; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.places (id, name, address, town, postcode, category, description, phone, website, image_url, dog_policy, water_bowls, dog_treats, dog_menu, latitude, longitude, rating, review_count, opening_hours, address2, verified, verified_at, important_info, photos, hotel_info, dog_charge, max_dogs, dog_charge_amount) FROM stdin;
d8cd80cc-77ab-448e-a05a-e2a033516db5	The Riverside Kitchen	1 Riverside Walk	Oxford	OX2 6BN	{restaurant}	Enjoy fine dining beside the Thames with your four-legged companion. Dogs are welcomed in our riverside terrace area. We always have fresh water available and often have treats behind the bar.	01865 555123	https://riversidekitchen.co.uk	/images/restaurant1.jpg	dogs_outside	t	f	f	51.748	-1.2632	4.5	89	\N	\N	f	\N	\N	\N	\N	f	\N	\N
d09be4d9-c64f-48a1-a4bf-9e00d3c265f4	Paws & Pints	22 Bath Road	Swindon	SN1 4AU	{pub}	Swindon's original dog-friendly pub. We host monthly dog meetups, and our garden is fully enclosed so your dog can roam free. Full dog menu available including birthday cakes on request.	01793 456789	https://pawsandpints.co.uk	/images/pub2.jpg	dogs_both	t	t	t	51.5632	-1.7832	4.7	156	\N	\N	f	\N	\N	\N	\N	f	\N	\N
f0c7e54e-8e1d-4f0f-a9e4-29a79493d151	Hounds Coffee House	8 Regent Street	Swindon	SN1 1JL	{cafe}	A café that truly loves dogs. Find a dedicated dog corner with beds, toys and water. Our baristas know how to make a 'puppuccino' and we sell dog-friendly pastries every weekend.	01793 778899	https://houndscoffee.co.uk	/images/cafe2.jpg	dogs_inside	t	t	t	51.5595	-1.784	4.6	77	\N	\N	f	\N	\N	\N	\N	f	\N	\N
90ad9f5e-f33f-4b63-9dcb-1233f9e9db18	The Leash & Larder	45 George Street	Bath	BA1 2EH	{restaurant}	A charming restaurant in the heart of Bath where dogs are genuinely celebrated. Our chef creates a weekly rotating dog menu, and dogs eat free on Sundays. Resident dog Barley says hello.	01225 334455	https://leashandlarder.co.uk	/images/restaurant2.jpg	dogs_both	t	t	t	51.38	-2.36	4.9	311	\N	\N	f	\N	\N	\N	\N	f	\N	\N
193a5d40-00e2-4371-b9ea-b1d07e44a39c	Roman Bath Outfitters	7 Union Street	Bath	BA1 1RH	{retail}	Independent outdoor and lifestyle store welcoming dogs on leads throughout. Browse our range of walking gear, home goods and gifts with your canine companion by your side.	01225 667788	https://romanbathoutfitters.co.uk	/images/retail1.jpg	dogs_inside	t	f	f	51.3825	-2.3635	4.3	42	\N	\N	f	\N	\N	\N	\N	f	\N	\N
62fa38ea-63ce-49ac-a74d-89466905024a	The Woofington Arms	3 Church Lane	Bristol	BS1 5TR	{pub}	Bristol's best kept secret for dog lovers. This cosy pub has a dedicated dog area with raised beds and natural toys. Dog birthdays celebrated for free with a pupcake and a photo!	0117 923 4567	https://woofingtonarms.co.uk	/images/pub3.jpg	dogs_both	t	t	t	51.4545	-2.5879	4.8	198	\N	\N	f	\N	\N	\N	\N	f	\N	\N
d46efe86-8454-46bc-a97c-183d9ba9874f	Clifton Coffee Roasters	12 Princess Victoria Street	Bristol	BS8 4BX	{cafe}	Award-winning specialty coffee roasters in Clifton. Dogs are welcome inside and on our sunny terrace. We keep dog biscuits behind the counter and always have a fresh bowl of water waiting.	0117 946 7890	https://cliftoncoffeeroasters.co.uk	/images/cafe3.jpg	dogs_both	t	t	f	51.459	-2.6151	4.7	145	\N	\N	f	\N	\N	\N	\N	f	\N	\N
b88250e9-9ff7-4aff-bcf4-ae49705ec986	Harbour View Hotel	Anchor Road	Bristol	BS1 5LL	{hotel}	A boutique hotel overlooking Bristol's iconic harbour. We welcome dogs of all sizes with a dedicated welcome pack including a bed, bowls and local dog walking maps. A true home away from home.	0117 910 1234	https://harbourviewhotel.co.uk	/images/hotel1.jpg	dogs_inside	t	t	f	51.449	-2.599	4.6	87	\N	\N	f	\N	\N	\N	\N	f	\N	\N
6727b9d2-f50c-4685-8a8a-cdc39863ae36	The Green Park Tearoom	Green Park Station	Bath	BA1 1JB	{cafe}	Set in the stunning Victorian Green Park Station, this tearoom is a favourite of Bath's dog-walking community. Dogs are welcome throughout and we serve a selection of dog-friendly cakes.	01225 448899	https://greenparktearooms.co.uk	/images/cafe4.jpg	dogs_inside	t	t	f	51.3782	-2.3709	4.5	93	\N	\N	f	\N	\N	\N	\N	f	\N	\N
01905e1a-e928-43b3-926d-af603b995409	Cotswold Country Supplies	15 Sheep Street	Burford	OX18 4LP	{retail}	A wonderful country store stocking everything for the rural lifestyle. Dogs are always welcome and we have a huge pet section. Our staff are all dog owners who love meeting your pups.	01993 822334	https://cotswoldcountrysupplies.co.uk	/images/retail2.jpg	dogs_inside	t	t	f	51.8067	-1.838	4.4	55	\N	\N	f	\N	\N	\N	\N	f	\N	\N
5b7b5b51-42f1-4af9-bb7f-89fcead068a7	The Old Mill	Mill Lane	Burford	OX18 4RY	{pub}	A picturesque 16th century mill pub with a stunning mill-pond garden. Perfect for a post-walk pint with your dog. We have a dedicated dog menu with homemade sausages and rice.	01993 822556	https://oldmillburford.co.uk	/images/pub4.jpg	dogs_both	t	t	t	51.8032	-1.841	4.7	167	\N	\N	f	\N	\N	\N	\N	f	\N	\N
5cbc3f18-f951-4698-92d4-df7bb463bd0f	Victoria Park Cafe	Victoria Park	Bristol	BS3 4RR	{cafe}	A beloved park café right in the heart of Victoria Park. We cater specifically for dog walkers with a dedicated outdoor seating area, water stations and a range of treats for the pooches.	0117 963 0011	\N	/images/cafe5.jpg	dogs_outside	t	t	f	51.439	-2.596	4.3	72	\N	\N	f	\N	\N	\N	\N	f	\N	\N
11a85082-2310-4de9-ad9b-10426afe37ea	Tail & Terrace	6 Regent Circus	Swindon	SN1 1PR	{restaurant}	Contemporary dining in Swindon with a beautifully landscaped dog-friendly terrace. Our weekend brunch is legendary and we always have puppuccinos and pupcakes available for our four-legged guests.	01793 221100	https://tailandterrace.co.uk	/images/restaurant3.jpg	dogs_outside	t	t	t	51.5618	-1.7794	4.5	109	\N	\N	f	\N	\N	\N	\N	f	\N	\N
e0064288-c3e0-4706-b090-368e2947402f	The Dog & Duck	12 High Street	Oxford	OX1 4AA	{pub}	A traditional Oxford pub with a warm welcome for dogs of all sizes. Our flagstone floors and roaring fire make it the perfect spot after a countryside walk. Dogs get their own biscuit tin at the bar.	01865 123456	https://dogandduck-oxford.co.uk	/images/pub1.jpg	dogs_both	t	t	f	51.752	-1.2577	4.8	124	\N	\N	t	2026-03-01 20:49:57.465	\N	\N	\N	f	\N	\N
880c0358-0d90-49d7-bb61-ca879a9e1e5a	Brew & Biscuit	5 Market Place	Oxford	OX1 3HB	{cafe}	Oxford's most dog-friendly café. We serve artisan coffee alongside a special dog menu featuring homemade pupcakes and dog-safe treats. Water stations on every table.	01865 987654	https://brewandbiscuit.co.uk	/images/cafe1.jpg	dogs_both	t	t	t	51.7535	-1.254	4.9	203	\N	\N	f	\N	\N	\N	\N	f	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password) FROM stdin;
\.


--
-- Name: places places_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- PostgreSQL database dump complete
--

\unrestrict UT8JGkvCG5FrpOqgS7FaUxYypWpSu8d2oUOaiufuWBAjAr5B2l1rnTeaFfOVLC3

