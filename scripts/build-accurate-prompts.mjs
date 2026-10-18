import fs from 'fs';
import path from 'path';

// Load manifest to ensure we cover all 414 cards exactly
const manifestPath = path.resolve('public/cards/MANIFEST.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const allCards = manifest.cards || [];

console.log(`Loaded ${allCards.length} cards from MANIFEST.json`);

// Handcrafted dictionary for base cards & festivals
const EXACT_PROMPTS = {
  // Existing 86 base cards:
  'abyss-01': 'masterpiece, best quality, ultra-detailed, tiny glowing baby jellyfish, luminous polyp, translucent round bell, delicate glowing tendrils, floating plankton, abyssal ocean darkness, soft cyan bioluminescence',
  'abyss-02': 'masterpiece, best quality, ultra-detailed, metallic silver deep sea spiny needlefish, sharp metallic fins and dorsal spines, glowing cyan eyes, swimming through dark oceanic trench, underwater bubbles',
  'abyss-03': 'masterpiece, best quality, ultra-detailed, glowing prismatic sea anemone, crystal translucent tentacles refracting rainbow light, hydrothermal volcanic ocean vent, dark seabed rocks, bioluminescent glow',
  'abyss-04': 'masterpiece, best quality, ultra-detailed, deep sea venomous sea urchin, glowing electric blue rings on sharp long needles, sapphire bioluminescent points, oceanic dark seabed, caustics',
  'abyss-05': 'masterpiece, best quality, ultra-detailed, ancient starlight starfish, glowing emerald green bioluminescent moss on stone texture, resting on sunken coral temple ruins in dark sea floor',
  'abyss-06': 'masterpiece, best quality, ultra-detailed, elegant translucent purple glazed jellyfish, delicate feather-like frilled oral arms, violet and amethyst glow, deep water caustics, floating particles',
  'abyss-07': 'masterpiece, best quality, ultra-detailed, Portuguese man-of-war siphonophore jellyfish, iridescent blue floating sail crest, long trailing glowing venom tentacles, midnight ocean abyss',
  'abyss-08': 'masterpiece, best quality, ultra-detailed, black pearl chambered nautilus, lustrous obsidian spiral shell with golden geometric filigree, swimming in deep sea darkness, glowing sea flora',
  'abyss-09': 'masterpiece, best quality, ultra-detailed, crimson immortal lighthouse jellyfish, glowing ruby core lantern organ, long gossamer tentacles trailing through deep abyssal trench, red bioluminescence',
  'abyss-10': 'masterpiece, best quality, ultra-detailed, cute baby azure sea dragon whelp, glistening cyan scales, translucent aquatic fins, swimming inside a glowing water bubble sphere, deep sea',
  'abyss-11': 'masterpiece, best quality, ultra-detailed, clione sea angel, translucent glowing butterfly wings, ethereal aquatic spirit fairy creature, glowing cyan and magenta heart, dark ocean caustics',
  'abyss-12': 'masterpiece, best quality, ultra-detailed, 1girl, ethereal abyssal mermaid princess, silver cyan hair, translucent fin ears, luminous scales, deep blue ocean trench, caustics, glowing plankton',
  'abyss-13': 'masterpiece, best quality, ultra-detailed, colossal ancient whale leviathan titan, carrying ancient sunken Atlantis temple ruins and coral spires on its back, bioluminescent blue sea vents, deep ocean',
  'abyss-14': 'masterpiece, best quality, ultra-detailed, gargantuan primordial jellyfish queen sovereign, colossal translucent cyan umbrella with fractal gossamer veils, deep ocean abyss, underwater aurora light',
  'abyss-15': 'masterpiece, best quality, ultra-detailed, 1girl, deep sea queen, flowing iridescent veil, glowing sapphire crown, floating in dark oceanic void, surrounded by luminous jellyfish',
  'abyss-16': 'masterpiece, best quality, ultra-detailed, mythical emerald green sea serpent dragon whelp, lustrous jade scales, translucent sea fins, coiling playfully around glowing oceanic pearl',
  'abyss-17': 'masterpiece, best quality, ultra-detailed, giant deep sea spider crab, vibrant glowing bioluminescent corals and sea anemones growing on rocky carapace, walking on abyssal ocean floor',
  'abyss-18': 'masterpiece, best quality, ultra-detailed, ghostly ethereal tidal jellyfish, translucent glowing white and turquoise phantom veil tentacles, swimming through glowing moonlit ocean swells',

  'nocturne-01': 'masterpiece, best quality, ultra-detailed, 1girl, cute young anime mage apprentice, pointy witch hat, holding carved wooden staff casting purple star sparkles, library with spellbooks, gothic anime',
  'nocturne-02': 'masterpiece, best quality, ultra-detailed, mystical black raven bird, glowing crimson eyes, obsidian glossy feathers, perched on gothic stone gargoyle cathedral spire, giant full moon, dark misty sky',
  'nocturne-03': 'masterpiece, best quality, ultra-detailed, adorable black winged cat familiar, glowing amber eyes, smoky ember flame tail, floating above antique open magic grimoire book, mystical library',
  'nocturne-04': 'masterpiece, best quality, ultra-detailed, dark shadow wraith phantom servant, faceless dark hooded cowl, glowing violet spirit lantern, gliding through misty gothic castle stone hallway',
  'nocturne-05': 'masterpiece, best quality, ultra-detailed, 1girl, anime ninja assassin Chizuru, sleek black and purple ninja outfit, wielding twin crescent moon daggers, moonlight on gothic rooftop',
  'nocturne-06': 'masterpiece, best quality, ultra-detailed, 1girl, beautiful anime alchemist, blonde hair, round glasses, holding glowing emerald elixir potion flask, alchemy laboratory with glassware, magic circles',
  'nocturne-07': 'masterpiece, best quality, ultra-detailed, 1boy, handsome anime gunslinger, black leather duster coat, holding dual engraved silver revolvers, swirling red rose petals, moonlit gothic ruins',
  'nocturne-08': 'masterpiece, best quality, ultra-detailed, 1girl, gothic anime scarlet nun, black and red habit veil, silver cross necklace, holding ornate holy rapier sword, stained glass cathedral, red moonlight',
  'nocturne-09': 'masterpiece, best quality, ultra-detailed, 1boy, celestial anime magus sorcerer, silver hair, deep blue robes embroidered with gold constellations, crystal staff radiating starlight, galaxy cosmos',
  'nocturne-10': 'masterpiece, best quality, ultra-detailed, 1girl, vampire empress Lilith, crimson velvet gown, gold crown, dark bat wings, gothic throne room, goblets of wine, red full moon',
  'nocturne-11': 'masterpiece, best quality, ultra-detailed, 1boy, fallen angel archangel Lucifer, twelve glorious obsidian black feathered wings, dark gothic silver plate armor, broadsword burning with black flame',
  'nocturne-12': 'masterpiece, best quality, ultra-detailed, 1girl, ethereal silver-white haired anime sorceress goddess, floating in cosmos, holding orb of swirling galaxy, glowing arcane circles, violet astral light',
  'nocturne-13': 'masterpiece, best quality, ultra-detailed, 1girl, supreme dark empress Camilla, magnificent obsidian crown, flowing black and blood-red royal gown, seated on grand skull throne, full blood moon',
  'nocturne-14': 'masterpiece, best quality, ultra-detailed, fierce stone gargoyle demon statue, bat wings, glowing red eyes, crouching on gothic cathedral roof spire, thunderstorm lightning, dark rain',
  'nocturne-15': 'masterpiece, best quality, ultra-detailed, 1girl, mysterious anime astrologer, navy blue hooded cloak with gold embroidery, gazing into glowing crystal celestial sphere, glowing zodiac star chart',
  'nocturne-16': 'masterpiece, best quality, ultra-detailed, 1girl, gothic grim reaper goddess Hel, black hooded cowl, ornate silver scythe with spectral blue mist, misty graveyard, floating spirit wisps',
  'nocturne-17': 'masterpiece, best quality, ultra-detailed, imposing anime demon lord Baal, curved obsidian horns, dark spiky armor with glowing crimson magma cracks, seated on throne of dark stone and skulls',

  'neon-01': 'masterpiece, best quality, ultra-detailed, sleek robotic police dog, armored cybernetic plating, glowing cyan optics, walking on rain-slicked cyberpunk street, neon city reflections at night',
  'neon-02': 'masterpiece, best quality, ultra-detailed, 1boy, anime cyberpunk courier rider, high-tech motorcycle, helmet with neon orange visor, rain-soaked asphalt, futuristic skyscrapers with neon signs',
  'neon-03': 'masterpiece, best quality, ultra-detailed, 1girl, energetic anime cyberpunk graffiti hacker girl, twintails, spraying glowing neon graffiti on brick wall, holographic AR goggles, cyber alley',
  'neon-04': 'masterpiece, best quality, ultra-detailed, 1man, veteran cyberpunk ripperdoc mechanic, bionic eye, cybernetic robotic arm with precision tools, cluttered high-tech repair clinic, glowing wires',
  'neon-05': 'masterpiece, best quality, ultra-detailed, 1boy, cyber ronin samurai warrior, sleek dark armor, glowing cyan high-frequency katana blade, robotic eye implant, rain-slicked neon street',
  'neon-06': 'masterpiece, best quality, ultra-detailed, 1girl, beautiful holographic anime pop idol singer, translucent cyan and magenta shimmering body, holding microphone on illuminated neon concert stage',
  'neon-07': 'masterpiece, best quality, ultra-detailed, 1girl, mecha musume, pilot in heavy white and orange armored battlesuit, shoulder missile pods, plasma cannon, futuristic hangar launch bay',
  'neon-08': 'masterpiece, best quality, ultra-detailed, cyber matrix ghost phantom, humanoid silhouette formed from green cascading digital matrix code and optical circuit fibers, dark digital cyberspace',
  'neon-09': 'masterpiece, best quality, ultra-detailed, 1boy, ruthless cyberpunk corporate inquisitor, black armored trench coat, glowing red holographic visor, dual glowing plasma energy blades, rooftop',
  'neon-10': 'masterpiece, best quality, ultra-detailed, 1girl, colossal glowing blonde holographic anime goddess interface Gaia, floating inside dark supercomputer server room, optic cables, floating data cubes',
  'neon-11': 'masterpiece, best quality, ultra-detailed, 1girl, cyberpunk sniper assassin, neon purple visor, futuristic railgun sniper rifle, perched on neon skyscraper rooftop at rainy night',
  'neon-12': 'masterpiece, best quality, ultra-detailed, hooded netrunner hacker silhouette, surrounded by floating holographic screens, neon purple skull cyber terminal, dark web matrix node',
  'neon-13': 'masterpiece, best quality, ultra-detailed, 1girl, strict cyberpunk police enforcer chief, tactical coat, high-tech anti-materiel sniper rifle, flying police drones, neon metropolis balcony',
  'neon-14': 'masterpiece, best quality, ultra-detailed, 1girl, anime cyborg girl floating inside transparent cylindrical cryogenic stasis pod, glowing blue neural cables connected to head, opening glowing eyes',

  'beast-01': 'masterpiece, best quality, ultra-detailed, adorable baby spirit fox kit, pure white fur, blue spiritual flame hovering above head, curled on mossy branch under glowing starry night sky',
  'beast-02': 'masterpiece, best quality, ultra-detailed, graceful mystical white cat, two fluffy split tails with icy mist, glowing sapphire eyes, walking on snowy tree branch leaving glowing frost pawprints',
  'beast-03': 'masterpiece, best quality, ultra-detailed, young silver wolf pup, small crystalline horn on forehead, howling at glowing green aurora borealis on snowy mountain summit, starry night',
  'beast-04': 'masterpiece, best quality, ultra-detailed, cute baby pegasus foal, pure white coat, small feathered wings, standing on soft pink celestial clouds under starlight, pastel fantasy colors',
  'beast-05': 'masterpiece, best quality, ultra-detailed, majestic red kitsune fox, three fiery tails trailing burning embers and spiritual flames, amber eyes, misty bamboo forest at night',
  'beast-06': 'masterpiece, best quality, ultra-detailed, colossal shadowy direwolf beast, glowing violet eyes, fur dissolving into dark mist, howling at giant full blood moon from rocky cliff',
  'beast-07': 'masterpiece, best quality, ultra-detailed, magnificent serpentine oriental dragon, lustrous emerald jade scales, golden whiskers and antlers, coiling around misty waterfall mountain peak',
  'beast-08': 'masterpiece, best quality, ultra-detailed, breathtaking pure white fox Yukihime, six elegant flowing tails, silver frost aura, standing under luminous giant full moon with falling sakura petals',
  'beast-09': 'masterpiece, best quality, ultra-detailed, majestic celestial white tiger Byakko, silver stripes crackling with azure lightning, prowling on misty mountain crag, thunderstorm sky',
  'beast-10': 'masterpiece, best quality, ultra-detailed, mythical golden sun lion, burning golden mane of pure solar fire, roaring atop sunlit sandstone cliff, golden dust aura',
  'beast-11': 'masterpiece, best quality, ultra-detailed, sacred divine oriental qilin kirin beast, golden dragon scales, glowing hooves standing on cloud, five-element mystic halo rings around antlers',
  'beast-12': 'masterpiece, best quality, ultra-detailed, colossal crystal behemoth bear, body formed of glowing sapphire and quartz crystals, stomping on icy mountain ridge, blizzard aurora sky',
  'beast-13': 'masterpiece, best quality, ultra-detailed, mythical phoenix peacock bird, iridescent rainbow plumage trailing sacred spiritual fire flames, standing proudly on ancient pagoda roof',
  'beast-14': 'masterpiece, best quality, ultra-detailed, mighty golden celestial roc eagle, feathers crackling with yellow thunder and lightning bolts, soaring across stormy clouds, epic fantasy',
  'beast-15': 'masterpiece, best quality, ultra-detailed, apocalyptic giant black wolf Fenrir, glowing red demonic runes carved into fur, broken iron chains, fangs dripping cosmic void, desolate battlefield',
  'beast-16': 'masterpiece, best quality, ultra-detailed, colossal ancient torch dragon Zhulong, crimson and obsidian scales, clutching blazing celestial torch in jaws, coiled around cosmic pillars in netherworld',

  // All 9 Festivals (14 cards each = 126 cards):
  'fest-halloween-01': 'masterpiece, best quality, ultra-detailed, 1girl, cute anime Halloween witch, pointy witch hat, orange and purple ruffled dress, holding carved glowing jack-o-lantern pumpkin, bats, full moon',
  'fest-halloween-02': 'masterpiece, best quality, ultra-detailed, spooky anime jester death reaper, black and purple clown costume, skull mask with glowing cyan smile, holding spectral cards and silver scythe',
  'fest-halloween-03': 'masterpiece, best quality, ultra-detailed, 1boy, handsome anime vampire count Dracula, ornate black and gold masquerade costume, velvet cape, holding crystal wine glass, gothic ballroom, bats',
  'fest-halloween-04': 'masterpiece, best quality, ultra-detailed, cute tiny pumpkin bat sprite fairy, orange bat wings, jack-o-lantern belly pattern, glowing yellow eyes, flying over pumpkin patch under autumn night sky',
  'fest-halloween-05': 'masterpiece, best quality, ultra-detailed, cute black cat wizard standing on hind legs, wearing oversized purple pointy witch hat with gold buckle, holding miniature glowing star magic wand, spellbook, candy floating',
  'fest-halloween-06': 'masterpiece, best quality, ultra-detailed, dullahan headless dark knight, imposing black plate armor, riding ghostly phantom warhorse, holding burning carved jack-o-lantern flaming head in one arm, spectral fog',
  'fest-halloween-07': 'masterpiece, best quality, ultra-detailed, cute plump bakery chef spirit creature, wearing white chef toque hat, holding freshly baked steaming golden pumpkin pie with sugar cream spiders, warm festive kitchen',
  'fest-halloween-08': 'masterpiece, best quality, ultra-detailed, 1man, tall handsome grey werewolf aristocrat, wearing dark crimson velvet tuxedo suit and gold masquerade mask, white cuffs, moonlit balcony, full orange harvest moon',
  'fest-halloween-09': 'masterpiece, best quality, ultra-detailed, colossal floating translucent white ghost monarch, wearing golden royal crown with purple gems, mischievous smiling face, holding pumpkin scepter, surrounded by floating wrapped candies and mini wisps',
  'fest-halloween-10': 'masterpiece, best quality, ultra-detailed, 1girl, cute anime succubus nun, black and white nun habit, small curved demon horns, dark bat wings, heart-tipped demon tail, holding gothic rosary, mischievous wink, gothic chapel',
  'fest-halloween-11': 'masterpiece, best quality, ultra-detailed, colossal mythical Halloween dragon, dragon scales made of glowing carved jack-o-lantern pumpkin shells, breathing brilliant golden-orange fire, perched on haunted castle tower',
  'fest-halloween-12': 'masterpiece, best quality, ultra-detailed, elderly ethereal translucent ghost butler, formal black tails suit, monocle, floating above checkered floor, carrying silver tea tray with glowing purple potion goblet',
  'fest-halloween-13': 'masterpiece, best quality, ultra-detailed, colossal towering dark eldritch deity of Halloween, flaming giant jack-o-lantern head, grand ragged black and orange cape, wielding massive demonic scythe, swarms of bats and ghosts, blood moon',
  'fest-halloween-14': 'masterpiece, best quality, ultra-detailed, adorable baby devil imp, tiny red horns and pointed tail, holding an oversized rainbow swirl lollipop and bag spilling colorful wrapped trick-or-treat candies, cute chibi expression',

  'fest-christmas-01': 'masterpiece, best quality, ultra-detailed, 1girl, adorable anime winter snow fairy Noel, red and white fluffy santa outfit, translucent icy wings, holding gift box with golden ribbon, falling snow',
  'fest-christmas-02': 'masterpiece, best quality, ultra-detailed, magnificent divine white reindeer stag Yule, crystalline antlers glowing with emerald and magenta aurora borealis, snowy pine forest, winter stars',
  'fest-christmas-03': 'masterpiece, best quality, ultra-detailed, majestic Santa Claus, thick white beard, ornate red and gold velvet fur-trimmed coat, holding magic star staff, snowy rooftops under starry sky',
  'fest-christmas-04': 'masterpiece, best quality, ultra-detailed, cute animated crispy gingerbread man warrior, white icing armor trims, red gumdrop buttons, wielding a sharp cinnamon stick sword, standing on frosted cake landscape',
  'fest-christmas-05': 'masterpiece, best quality, ultra-detailed, 1girl, tiny cute Christmas bell fairy girl, green festive dress, ringing a pair of polished golden bells with red holly ribbon, sparkling golden star dust, falling snow',
  'fest-christmas-06': 'masterpiece, best quality, ultra-detailed, 1girl, beautiful anime winter maiden, warm red woolen scarf, knitted cream coat, standing beneath hanging green mistletoe branch with red berries, gentle blush, warm holiday lights',
  'fest-christmas-07': 'masterpiece, best quality, ultra-detailed, giant adorable fluffy white yeti creature, wearing an oversized red knitted scarf and festive earmuffs, holding a hot cocoa mug with marshmallows, cozy snowy pine forest',
  'fest-christmas-08': 'masterpiece, best quality, ultra-detailed, cute old gnome toymaker craftsman, curly white beard, green pointed elf hat, wooden spectacles, sitting at workbench repairing vintage tin soldier toys and wooden horses, glowing lamp',
  'fest-christmas-09': 'masterpiece, best quality, ultra-detailed, 1girl, ethereal anime snow goddess, diamond snowflake crystal tiara, flowing translucent ice-blue gown, floating diamond dust, icy frozen castle background',
  'fest-christmas-10': 'masterpiece, best quality, ultra-detailed, pure white mythical unicorn, spiraling crystalline golden horn radiating warm celestial light, mane adorned with silver tinsel and holly, snowy enchanted forest under starry night',
  'fest-christmas-11': 'masterpiece, best quality, ultra-detailed, glorious saint Nicholas apex god, riding ornate gold flying sleigh pulled by flying reindeer, soaring through night clouds above glowing Christmas city lights',
  'fest-christmas-12': 'masterpiece, best quality, ultra-detailed, 1girl, cute little blonde cherub angel, feathered white wings, gold halo, holding a glowing golden heart-shaped padlock, surrounded by floating golden star ornaments',
  'fest-christmas-13': 'masterpiece, best quality, ultra-detailed, 1girl, supreme cosmic goddess of winter holidays, grand flowing gown made of northern aurora lights and silver snow, blessing the frozen planet with eternal warmth and joy',
  'fest-christmas-14': 'masterpiece, best quality, ultra-detailed, 1girl, cute winter anime princess, red and white striped fur-lined coat, holding a giant twisted red and white peppermint candy cane staff, smiling, snowy village',

  'fest-newyear-01': 'masterpiece, best quality, ultra-detailed, 1girl, beautiful anime shrine maiden dawn goddess Asahi, white and crimson ceremonial kimono, holding golden bells, sunrise over Mount Fuji, red sun',
  'fest-newyear-02': 'masterpiece, best quality, ultra-detailed, serpentine golden Chinese dragon, imperial golden scales, holding blazing red celestial pearl, surrounded by red festival lanterns and gold coins',
  'fest-newyear-03': 'masterpiece, best quality, ultra-detailed, jovial Japanese fortune god Ebisu, holding giant golden red sea bream fish and fishing rod, wearing green formal robes, golden coins raining',
  'fest-newyear-04': 'masterpiece, best quality, ultra-detailed, cute Chinese chibi boy, wearing traditional red silk festival vest and pants, holding a long stick of exploding red firecrackers and sparklers, smoke and festival confetti',
  'fest-newyear-05': 'masterpiece, best quality, ultra-detailed, 1girl, cute chibi spring fairy girl, wearing yellow and red embroidered qipao, hugging a giant ripe golden kumquat orange, gold yuanbao ingots at feet',
  'fest-newyear-06': 'masterpiece, best quality, ultra-detailed, cute miniature Chinese lion dance creature, vibrant crimson and gold fluffy fur, big expressive blinking eyes, balancing on an ornate red silk embroidered ball, spring scrolls',
  'fest-newyear-07': 'masterpiece, best quality, ultra-detailed, 1girl, elegant anime goddess, wearing opulent red silk qipao cheongsam with golden peony embroidery, holding an ornate jade and gold ruyi scepter, red lanterns, blossoming plum branches',
  'fest-newyear-08': 'masterpiece, best quality, ultra-detailed, 1girl, gentle anime maiden in pastel pink and white hanfu, holding a glowing octagonal palace lantern, floating on wooden boat along river reflecting thousands of floating water lanterns',
  'fest-newyear-09': 'masterpiece, best quality, ultra-detailed, majestic giant red and golden carp koi fish leaping out of swirling turquoise waters, spraying glowing golden droplets, carrying a crimson lucky banner, festival fireworks',
  'fest-newyear-10': 'masterpiece, best quality, ultra-detailed, mighty ancient Chinese door god warrior general Shen Tu, gleaming dragon armor with red tassels, holding a giant carved peach wood battle halberd, fierce protective aura',
  'fest-newyear-11': 'masterpiece, best quality, ultra-detailed, divine three-legged golden crow sun bird, feathers burning with pure solar golden flames, spreading magnificent wings across dawn horizon as the morning sun rises',
  'fest-newyear-12': 'masterpiece, best quality, ultra-detailed, adorable plump golden piggy spirit, wearing a red lucky collar with a gold bell, carrying a wooden cart filled with glittering gold ingots and ancient coins',
  'fest-newyear-13': 'masterpiece, best quality, ultra-detailed, colossal primordial Chinese celestial dragon god, shimmering gold and jade dragon scales, coiling across starry cosmos, breathing creation light, surrounded by eternal spring flowers',
  'fest-newyear-14': 'masterpiece, best quality, ultra-detailed, 1girl, delicate spring anime fairy, flowing emerald green silk ribbons, holding a slender fresh weeping willow branch that touches frozen waters, turning them into spring blossoms',

  'fest-valentines-01': 'masterpiece, best quality, ultra-detailed, 1girl, cute anime chocolatier girl, holding heart-shaped chocolate gift box with pink silk ribbons, romantic cafe setting, floating sweet hearts',
  'fest-valentines-02': 'masterpiece, best quality, ultra-detailed, 1girl, gorgeous blonde anime bride Victoria, elaborate translucent white lace wedding gown, crystal rose veil, holding glowing white rose bouquet, chapel',
  'fest-valentines-03': 'masterpiece, best quality, ultra-detailed, 1boy, handsome anime knight Lancelot, silver plate armor with engraved red roses, holding holy broadsword plunged into altar of red rose petals, stained glass window',
  'fest-valentines-04': 'masterpiece, best quality, ultra-detailed, cute anime baby cherub cupid, blonde curls, soft white feathered wings, aiming a miniature golden bow with a glowing heart-shaped pink crystal arrow, pink clouds',
  'fest-valentines-05': 'masterpiece, best quality, ultra-detailed, cute pastry fairy creature, sitting atop a gourmet dark chocolate truffle coated with powdered sugar and fresh red strawberry slice, chocolate drizzle, romantic cafe',
  'fest-valentines-06': 'masterpiece, best quality, ultra-detailed, pure white carrier dove bird in flight, holding a sealed pink love letter with red wax heart seal in beak, fluttering white and pink feathers, soft sunset sky',
  'fest-valentines-07': 'masterpiece, best quality, ultra-detailed, 1girl, cute anime pastry chef girl Charlotte, pastel pink apron and baker hat, decorating an elaborate three-tier heart-shaped chocolate cake with fresh strawberries and macarons',
  'fest-valentines-08': 'masterpiece, best quality, ultra-detailed, pair of elegant translucent crystal glass swans on a quiet rose-tinted lake, their graceful curved necks forming a perfect heart silhouette, floating pink water lilies, moonlit mist',
  'fest-valentines-09': 'masterpiece, best quality, ultra-detailed, 1boy, handsome young anime knight, midnight blue tunic and silver pauldrons, kneeling with hand over heart offering a single radiant glowing red rose, gothic balcony, starry sky',
  'fest-valentines-10': 'masterpiece, best quality, ultra-detailed, 1girl, breathtaking anime maiden Juliet, wearing an ornate crown of blooming red and pink roses, flowing white chiffon dress, standing on moonlit balcony with falling petals',
  'fest-valentines-11': 'masterpiece, best quality, ultra-detailed, 1girl, magnificent goddess of love Aphrodite, breathtaking classical beauty, emerging from sparkling white ocean foam onto a giant pink scallop shell, floating pink roses, golden hair',
  'fest-valentines-12': 'masterpiece, best quality, ultra-detailed, cute tiny fairy girl with translucent sugary wings, splashing playfully in the cascades of a giant tiered warm melted chocolate fondue fountain, holding a strawberry',
  'fest-valentines-13': 'masterpiece, best quality, ultra-detailed, 1girl, supreme cosmic goddess of eternal love, flowing starlight gown, holding two interlocked glowing diamond wedding rings that create a glowing heart nebula in deep space',
  'fest-valentines-14': 'masterpiece, best quality, ultra-detailed, giant plush pink teddy bear knight, stitched seams, holding an oversized plush red velvet heart with both paws, seated protectively in a cozy bedroom with fairy lights',

  'fest-sakura-01': 'masterpiece, best quality, ultra-detailed, 1girl, beautiful anime swordswoman Miou, pink sakura floral kimono armor, wielding katana sword cutting through whirlwind of cherry blossom petals',
  'fest-sakura-02': 'masterpiece, best quality, ultra-detailed, 1girl, ethereal anime tree spirit goddess, hair of blooming pink cherry blossoms, petal dress, sitting on giant ancient glowing sacred sakura tree',
  'fest-sakura-03': 'masterpiece, best quality, ultra-detailed, 1girl, graceful celestial maiden dancing at night under full moon, transparent winged kimono, surrounded by falling glowing sakura blossom petals, paper lanterns',
  'fest-sakura-04': 'masterpiece, best quality, ultra-detailed, cute tiny cherry blossom petal fairy, dress made of five pink sakura petals, floating on a spring breeze through a blooming cherry tree branch, morning dew drops',
  'fest-sakura-05': 'masterpiece, best quality, ultra-detailed, cute Japanese tanuki raccoon dog, red hachimaki headband tied around head, enthusiastically beating a large wooden taiko drum, pink sakura petals dancing in air',
  'fest-sakura-06': 'masterpiece, best quality, ultra-detailed, 1girl, serene anime maiden Chihiro, wearing elegant pale pink kimono with sakura crests, kneeling on tatami mat performing tea ceremony, holding green matcha bowl, red nodate parasol',
  'fest-sakura-07': 'masterpiece, best quality, ultra-detailed, 1boy, agile anime ninja Hayate, black shinobi outfit with pink scarf flowing in wind, leaping across cherry tree branches while throwing sakura-shaped shuriken blades',
  'fest-sakura-08': 'masterpiece, best quality, ultra-detailed, pure white three-tailed spirit fox, delicate pink cherry blossom floral markings along flanks, bushy tails tipped with petals, standing on mossy rock under full spring moon',
  'fest-sakura-09': 'masterpiece, best quality, ultra-detailed, 1boy, veteran samurai swordmaster Jubei, drawing glowing steel katana blade, blade movement releasing a roaring vortex storm of a thousand cherry blossom petals',
  'fest-sakura-10': 'masterpiece, best quality, ultra-detailed, 1girl, lovely anime girl in spring yukata, gently placing a wooden floating water lantern decorated with cherry blossoms into a clear river, lantern light reflecting on water',
  'fest-sakura-11': 'masterpiece, best quality, ultra-detailed, 1girl, supreme goddess of cherry blossoms Konohana Sakuya Hime, regal twelve-layered junihitoe kimono, crown of blossoms, sacred Mount Fuji in background with blooming pink forests',
  'fest-sakura-12': 'masterpiece, best quality, ultra-detailed, cute chibi fairy child, wearing candy-themed kimono, holding a bamboo jar overflowing with sparkling star-shaped pink and white sugar candies konpeito, cherry blossom trees',
  'fest-sakura-13': 'masterpiece, best quality, ultra-detailed, 1girl, divine primordial creator goddess of spring, wings formed from millions of swirling glowing pink sakura petals, holding a blossoming cosmic branch that restores barren galaxies',
  'fest-sakura-14': 'masterpiece, best quality, ultra-detailed, 1boy, handsome wandering swordsman, straw kasa hat, holding an oiled-paper umbrella painted with cherry blossoms, walking along mountain path in gentle spring drizzle',

  'fest-summer-01': 'masterpiece, best quality, ultra-detailed, 1girl, lovely anime girl Furin wearing dark blue goldfish yukata kimono, holding glass wind chime, festival paper lantern stalls, summer night fireworks',
  'fest-summer-02': 'masterpiece, best quality, ultra-detailed, mythical festival dragon formed from sparkling colorful fireworks, glowing sparks and trails, soaring over summer night festival lake',
  'fest-summer-03': 'masterpiece, best quality, ultra-detailed, group of cheerful anime youths in vibrant colorful yukata, laughing together holding sparklers and fans, walking through festival market alley illuminated by red paper lanterns',
  'fest-summer-04': 'masterpiece, best quality, ultra-detailed, 1girl, cute anime girl, wearing vibrant floral yukata, happily holding a glossy bright red candied apple on a wooden stick, summer night festival stalls in background',
  'fest-summer-05': 'masterpiece, best quality, ultra-detailed, 1boy, energetic muscular anime festival drummer, headband tied, swinging wooden bachi drumsticks with fiery passion on a colossal wooden taiko drum, explosive fireworks in sky',
  'fest-summer-06': 'masterpiece, best quality, ultra-detailed, cute tiny water fairy spirit, happily nestled inside a colorful striped bouncy rubber yo-yo water balloon, splashing water droplets, summer festival vibe',
  'fest-summer-07': 'masterpiece, best quality, ultra-detailed, imposing festival warrior guardian, traditional happi festival coat, carrying a magnificent gilded golden mikoshi portable shrine on strong shoulders, energetic crowd cheering',
  'fest-summer-08': 'masterpiece, best quality, ultra-detailed, 1man, veteran Japanese fireworks artisan Kagiya, traditional indigo work coat, standing by launch mortar tubes launching a giant radiant blooming chrysanthemum firework into night sky',
  'fest-summer-09': 'masterpiece, best quality, ultra-detailed, 1girl, tiny cute pixie girl, pouring vibrant neon syrups of strawberry red, blue hawaii, and melon green over a mountainous bowl of fluffy white shaved ice, festival spoon',
  'fest-summer-10': 'masterpiece, best quality, ultra-detailed, glorious solar phoenix bird, feathers radiating blinding golden heat and summer sunbeams, soaring high across brilliant clear turquoise summer sky above sparkling ocean',
  'fest-summer-11': 'masterpiece, best quality, ultra-detailed, 1boy, refined handsome anime nobleman, indigo patterned yukata kimono, casually flicking open an ornate bamboo folding fan, standing under glowing festival paper lanterns',
  'fest-summer-12': 'masterpiece, best quality, ultra-detailed, 1girl, supreme goddess of summer festivals, radiant fireworks halo behind head, flowing yukata made of glowing festival lights, wind chimes, eternal summer night sky',
  'fest-summer-13': 'masterpiece, best quality, ultra-detailed, cute chibi chef boy, red headband, apron, skillfully flipping sizzling golden round takoyaki octopus balls with metal picks on a hot iron grill plate, savory steam rising',
  'fest-summer-14': 'masterpiece, best quality, ultra-detailed, cute glowing spirit fairy with tiny luminous wings, glowing with bright emerald light, leading night travelers along willow-lined riverbank illuminated by festival lanterns',

  'fest-midautumn-01': 'masterpiece, best quality, ultra-detailed, 1girl, cute anime rabbit fairy Tangtang with long white bunny ears, holding golden mortar and pestle, plate of mooncakes, glowing crescent moon',
  'fest-midautumn-02': 'masterpiece, best quality, ultra-detailed, 1girl, Chang\'e ethereal moon goddess, holding cute white jade rabbit, flowing celestial silk robes, floating before colossal glowing silver full moon, osmanthus flowers',
  'fest-midautumn-03': 'masterpiece, best quality, ultra-detailed, cute tiny fairy sprite, rosy blushed cheeks, comfortably asleep inside a small ceramic wine cup next to a jug of fragrant golden osmanthus flower wine, yellow petals falling',
  'fest-midautumn-04': 'masterpiece, best quality, ultra-detailed, cute round pastry spirit creature, flaky golden crust, split open to reveal rich glowing molten salted egg yolk custard lava, sweet steam, mid-autumn festival banquet',
  'fest-midautumn-05': 'masterpiece, best quality, ultra-detailed, cute fluffy white bunny standing upright, wearing miniature servant robe, holding a small bamboo broom carefully sweeping fallen yellow osmanthus leaves on marble palace terrace',
  'fest-midautumn-06': 'masterpiece, best quality, ultra-detailed, mythical muscular woodcutter Wu Gang, swinging heavy iron axe against the trunk of an immortal giant lunar laurel tree with glowing silver wood, glowing yellow blossoms, starry moonscape',
  'fest-midautumn-07': 'masterpiece, best quality, ultra-detailed, 1girl, celestial moon charioteer goddess Wangshu, driving a gleaming silver chariot drawn by winged spirit horses across the river of stars, silver full moon shining',
  'fest-midautumn-08': 'masterpiece, best quality, ultra-detailed, 1girl, majestic Empress of the Moon, serene royal posture seated upon an ornate silver crescent throne, wearing layered silver and midnight blue imperial robes, massive full moon behind',
  'fest-midautumn-09': 'masterpiece, best quality, ultra-detailed, 1girl, adorable anime bunny girl, fluffy white rabbit ears and tail, holding a brightly glowing rabbit-shaped paper lantern on a bamboo stick, walking through fragrant osmanthus forest',
  'fest-midautumn-10': 'masterpiece, best quality, ultra-detailed, 1girl, celestial maiden with long flowing silver hair, playing an ancient white jade guqin zither, sound waves emitting luminous lunar silver ripples under midnight moon',
  'fest-midautumn-11': 'masterpiece, best quality, ultra-detailed, ethereal glowing silver spirit silhouette of a maiden gazing up at a radiant full harvest moon from a mountain cliff, holding a glowing lantern of reunion prayers',
  'fest-midautumn-12': 'masterpiece, best quality, ultra-detailed, 1girl, supreme creator moon goddess Chang\'e Apex, divine silver aura, holding the miniature silver moon sphere in palm, controlling oceanic tides and starlight across infinite galaxies',
  'fest-midautumn-13': 'masterpiece, best quality, ultra-detailed, 1girl, delicate translucent porcelain fairy girl, seated upon an exquisite snow-skin mooncake with molded lotus blossom patterns, dusted with powdery sugar, frosty sparkles',
  'fest-midautumn-14': 'masterpiece, best quality, ultra-detailed, cute celestial fairy artisan, delicate hands weaving a golden victory laurel crown from fresh fragrant yellow osmanthus blossoms, sitting on white jade balustrade under moon',

  'fest-anniv-01': 'masterpiece, best quality, ultra-detailed, cute anime fairy librarian Kura, small gossamer wings, holding oversized ornate golden key, floating in grand library with endless magical books',
  'fest-anniv-02': 'masterpiece, best quality, ultra-detailed, 1man, grand cosmic architect god, majestic posture, floating golden holographic cube matrix in hand, surrounded by orbiting celestial trading cards and galactic archive spires',
  'fest-anniv-03': 'masterpiece, best quality, ultra-detailed, 1girl, divine celestial weaver maiden goddess, flowing celestial silks, weaving tapestry of golden stardust and nebulas, celebratory fireworks',
  'fest-anniv-04': 'masterpiece, best quality, ultra-detailed, cute celebratory pixie girl with party cone hat, excitedly pulling string of a party popper, blasting an explosion of glittering gold foil streamers and colorful confetti',
  'fest-anniv-05': 'masterpiece, best quality, ultra-detailed, cute chibi coin spirit, holding an enormous heavy golden commemorative 1st anniversary coin engraved with abyssal jellyfish emblem, sparkling gold light, piles of treasure',
  'fest-anniv-06': 'masterpiece, best quality, ultra-detailed, cute scholarly bookworm creature with round glasses, using a golden sewing needle and shimmering thread to bind an ornate leather-bound grimoire labeled 414 Archive, library desk',
  'fest-anniv-07': 'masterpiece, best quality, ultra-detailed, 1girl, cheerful anime mecha girl Carol, twin mechanical ribbon cannons mounted on backpack, launching spirals of festive holographic ribbons and music notes into the party hall',
  'fest-anniv-08': 'masterpiece, best quality, ultra-detailed, wise elderly cosmic elder wizard, long white beard, holding a giant ornate golden master key unlocking a glowing dimensional gateway showing multiple parallel worlds and cards',
  'fest-anniv-09': 'masterpiece, best quality, ultra-detailed, 1boy, handsome anime butler in formal gold-trimmed black vest, pouring glowing golden bubbly champagne into the top cup of a towering pyramid of crystal champagne glasses',
  'fest-anniv-10': 'masterpiece, best quality, ultra-detailed, 1girl, celestial archivist scholar maiden, wearing star-patterned robes, using a golden quill pen to write in a massive floating golden ledger recording card summon miracles',
  'fest-anniv-11': 'masterpiece, best quality, ultra-detailed, magnificent floating imperial golden crown, encrusted with 414 radiant cut gemstones of diamond, sapphire, emerald, ruby, amethyst, glowing with rainbow prismatic aura',
  'fest-anniv-12': 'masterpiece, best quality, ultra-detailed, cute little waiter imp with bow tie, carefully balancing a nine-tier pastel rainbow macaron dessert tower on a silver tray, running across grand banquet table',
  'fest-anniv-13': 'masterpiece, best quality, ultra-detailed, 1girl, supreme creator goddess of the entire Abyssal Archive, floating in the center of the cosmos, holding a miniature glowing spiral galaxy, all 414 cards orbiting around her',
  'fest-anniv-14': 'masterpiece, best quality, ultra-detailed, translucent golden jellyfish paper lantern with golden silk frills and trailing fairy light tendrils, floating serenely beneath the cathedral vaulted ceiling of anniversary gala',

  'fest-eclipse-01': 'masterpiece, best quality, ultra-detailed, 1girl, mysterious dark-skinned anime priestess Nef, dark purple robes, holding obsidian sundial, dark solar eclipse in violet night sky',
  'fest-eclipse-02': 'masterpiece, best quality, ultra-detailed, 1girl, dark solar eclipse goddess, floating before black sun with fiery dark violet and magenta corona, black gown with gold trim, dark crown',
  'fest-eclipse-03': 'masterpiece, best quality, ultra-detailed, colossal shadow dragon Apophis, obsidian wings eclipsing the golden sun, black dragon scales with violet edges, total solar eclipse corona',
  'fest-eclipse-04': 'masterpiece, best quality, ultra-detailed, shadowy phantom assassin thrall, formed from deep shadows cast by the black sun eclipse, wielding twin curved obsidian daggers dripping purple smoke',
  'fest-eclipse-05': 'masterpiece, best quality, ultra-detailed, ancient obsidian stone sundial monument standing on barren rocky wasteland, glowing violet runic clock markings, shadow pointer frozen under black eclipsed sun',
  'fest-eclipse-06': 'masterpiece, best quality, ultra-detailed, colossal deep sea black jellyfish, translucent obsidian and deep indigo bell, pulsating with dark violet energy veins under sea during lunar eclipse, purple caustics',
  'fest-eclipse-07': 'masterpiece, best quality, ultra-detailed, 1boy, imposing dark knight riding an armored black warhorse, holding a massive two-handed greatsword engulfed in black and crimson flames, total solar eclipse background',
  'fest-eclipse-08': 'masterpiece, best quality, ultra-detailed, 1boy, dark anime high priest Osiris, ancient black ceremonial robes with gold astrological symbols, floating dark solar corona ring above head, dark temple altar',
  'fest-eclipse-09': 'masterpiece, best quality, ultra-detailed, colossal monstrous cosmic shadow wolf Skoll, glowing red eyes, leaping through starry void opening gargantuan jaws to swallow the glowing eclipsed sun',
  'fest-eclipse-10': 'masterpiece, best quality, ultra-detailed, 1girl, anime dark cosmic jellyfish princess, miniature black hole singularity pulsing at her chest, deep violet translucent umbrella, trailing cosmic star dust tentacles',
  'fest-eclipse-11': 'masterpiece, best quality, ultra-detailed, giant demonic vampire bat monarch, enormous leathery wings with razor bone claws, spreading wings wide against the blood-red rim of eclipsed black moon',
  'fest-eclipse-12': 'masterpiece, best quality, ultra-detailed, cute baby black dragon whelp, glossy obsidian scales with glowing violet magma fissures, curled playfully around a pulsating dark eclipse core sphere',
  'fest-eclipse-13': 'masterpiece, best quality, ultra-detailed, towering eldritch god of total solar eclipse, colossal shadowy cosmic silhouette crowned by the blazing dark corona of black sun, tearing open fabric of space-time',
  'fest-eclipse-14': 'masterpiece, best quality, ultra-detailed, giant predatory deep sea scorpion, body made of dark purple amethyst crystal plates, glowing venom stinger raised high under dark eclipse sky, rocky terrain'
};

// Builder function for permanent series (abyss-19 to 72, nocturne-18 to 72, neon-15 to 72, beast-17 to 72)
function getSubjectPromptForCard(card) {
  const { id, name, nameEn, series } = card;

  // Check if explicit prompt exists
  if (EXACT_PROMPTS[id]) {
    return EXACT_PROMPTS[id];
  }

  // Determine subject from card Chinese name and description
  let subjectDetail = '';
  let setting = '';

  if (series === 'abyssal-jellyfish') {
    setting = 'deep oceanic trench, dark abyss, underwater volumetric caustics, floating cyan bioluminescent plankton, high resolution 8k trading card art';
    
    if (name.includes('盲鰻') || nameEn.includes('Hagfish')) {
      subjectDetail = 'ancient luminous hagfish, slender eel-like body swimming near hydrothermal vents, glowing bioluminescent slime trails, dark oceanic seabed, realistic aquatic creature anatomy';
    } else if (name.includes('螺') || nameEn.includes('Snail') || nameEn.includes('Conch')) {
      subjectDetail = 'translucent crystal glass sea snail, glowing sapphire blue spiral shell with frost crystalline facets, gliding on seabed coral rocks';
    } else if (name.includes('蝦') || nameEn.includes('Shrimp')) {
      subjectDetail = 'transparent glass ghost shrimp, glowing cyan internal organ glow, long delicate antennae, crawling on abyssal coral branches';
    } else if (name.includes('海參') || nameEn.includes('Sea Cucumber')) {
      subjectDetail = 'deep sea benthic sea cucumber, covered in glowing amethyst violet crystalline spines and nodules, resting on abyssal silt';
    } else if (name.includes('浮游') || nameEn.includes('Plankton')) {
      subjectDetail = 'magical swarm of microscopic bioluminescent plankton organisms, glowing like a swirling spiral galaxy in midnight ocean depths';
    } else if (name.includes('飛魚') || nameEn.includes('Flying Fish')) {
      subjectDetail = 'sleek silver flying fish, wing-like pectoral fins with sharp metallic silver sheen, leaping through glowing midnight ocean swells';
    } else if (name.includes('海百合') || nameEn.includes('Crinoid')) {
      subjectDetail = 'ancient luminescent sea lily crinoid, feathery radiating arms with glowing golden and cyan tips, anchored to ancient submerged stone ruins';
    } else if (name.includes('烏賊') || name.includes('魷') || nameEn.includes('Squid')) {
      subjectDetail = 'deep sea firefly squid, glowing electric azure spots pulsing across mantle and tentacles, darting through pitch black ocean';
    } else if (name.includes('蟹') || nameEn.includes('Crab')) {
      subjectDetail = 'colossal heavy armored obsidian trench crab, massive metallic claws with razor teeth, walking firmly on rocky abyssal seabed';
    } else if (name.includes('海蛞蝓') || nameEn.includes('Nudibranch')) {
      subjectDetail = 'vibrant prismatic sea slug nudibranch, undulating rainbow ruffled mantle, translucent glowing sensory horns, crawling on sea floor';
    } else if (name.includes('海葵') || nameEn.includes('Anemone')) {
      subjectDetail = 'mystical deep sea anemone, cluster of glowing violet and emerald tentacles waving gently in dark oceanic currents';
    } else if (name.includes('海蝴蝶') || nameEn.includes('Sea Butterfly') || name.includes('海天使')) {
      subjectDetail = 'clione sea angel, translucent gelatinous body, glowing red heart, flapping wing-like parapodia in dark icy waters';
    } else if (name.includes('水蛇') || name.includes('海蛇') || nameEn.includes('Viper')) {
      subjectDetail = 'slender deep sea viper water snake, scales lined with glowing blue bioluminescent photophore dots, undulating through dark trench';
    } else if (name.includes('海膽') || nameEn.includes('Urchin')) {
      subjectDetail = 'crystalline sea urchin, sphere covered in long glowing glass needles radiating sapphire starlight, resting on seabed';
    } else if (name.includes('鮟鱇') || nameEn.includes('Anglerfish')) {
      subjectDetail = 'fierce abyssal anglerfish, massive jaws with needle teeth, glowing cyan esca lure bulb suspended above forehead illuminating the dark';
    } else if (name.includes('鰩') || nameEn.includes('Ray') || nameEn.includes('Torpedo')) {
      subjectDetail = 'majestic deep sea manta ray, broad triangular wings with icy glowing edges, gliding silently over deep ocean canyon';
    } else if (name.includes('章魚') || nameEn.includes('Octopus')) {
      subjectDetail = 'cute deep sea dumbo octopus, large ear-like fins flapping gently, translucent red and violet mantle, swimming in deep sea';
    } else if (name.includes('海龍') || nameEn.includes('Seadragon')) {
      subjectDetail = 'ornate leafy seadragon, delicate purple crystalline leaf appendages camouflaged among sea kelp, glistening scales';
    } else if (name.includes('海龜') || name.includes('龜') || nameEn.includes('Turtle')) {
      subjectDetail = 'ancient colossal sea turtle, shell resembling a solid slab of translucent green jade carrying ancient sunken coral formations';
    } else if (name.includes('龍鰻') || nameEn.includes('Moray')) {
      subjectDetail = 'colossal abyssal dragon moray eel, fierce dragon-like head emerging from dark trench crevice, electric sparks crackling along dorsal fin';
    } else if (name.includes('水母') || nameEn.includes('Jelly') || nameEn.includes('Medusa')) {
      subjectDetail = 'magnificent translucent deep sea jellyfish, glowing umbrella bell with intricate fractal veins, graceful flowing gossamer tentacles, cyan and violet glow';
    } else if (name.includes('鯊') || nameEn.includes('Megalodon') || nameEn.includes('Shark')) {
      subjectDetail = 'colossal prehistoric megalodon shark, silver armor-plated scales, powerful jaws filled with rows of razor teeth, cruising through dark trench';
    } else if (name.includes('女皇') || name.includes('姬') || name.includes('仙子') || name.includes('神侍') || name.includes('Maiden') || name.includes('Empress')) {
      subjectDetail = '1girl, beautiful anime deep sea goddess, flowing cyan hair, translucent frilled fins, glowing sapphire tiara, surrounded by luminous sea creatures';
    } else if (name.includes('波塞冬') || name.includes('海皇') || nameEn.includes('Poseidon')) {
      subjectDetail = '1man, imposing anime sea king Poseidon, muscular build, beard, holding a glowing golden three-pronged trident, royal crown, roaring tidal waves';
    } else if (name.includes('利維坦') || nameEn.includes('Leviathan')) {
      subjectDetail = 'gargantuan ancient leviathan world serpent titan, scales like tectonic plates, coiling around underwater oceanic abyss trench';
    } else if (name.includes('始源萬母') || nameEn.includes('Mother')) {
      subjectDetail = '1girl, supreme primordial mother goddess of the abyss, colossal celestial form, flowing starlight hair, holding the origin water sphere in space';
    } else {
      subjectDetail = `mythical deep sea oceanic creature ${nameEn}, bioluminescent glowing patterns, aquatic fins, swimming through deep oceanic darkness`;
    }
  } else if (series === 'nocturne-fantasy') {
    setting = 'dark gothic fantasy, moonlit midnight, gothic cathedral ruins, glowing violet magic circles, mystical particles, 8k resolution trading card art';

    if (name.includes('貓頭鷹') || nameEn.includes('Owl')) {
      subjectDetail = 'mystical dark barn owl, glowing amber eyes, sleek black and silver feathers, holding an antique wax-sealed scroll in talons, perched on gothic gargoyle';
    } else if (name.includes('火靈') || nameEn.includes('Wisp')) {
      subjectDetail = 'ethereal spectral will-o-wisp spirit, glowing cyan and violet flames dancing above mossy gothic cemetery gravestone';
    } else if (name.includes('石像鬼') || nameEn.includes('Gargoyle')) {
      subjectDetail = 'fierce stone gargoyle beast, carved obsidian stone texture, horned head, leathery bat wings spread wide, crouching on cathedral ledge in rain';
    } else if (name.includes('惡魔') || nameEn.includes('Imp')) {
      subjectDetail = 'mischievous little anime shadow imp devil, tiny curved horns, leathery wings, holding a miniature pitchfork, grinning from dark gothic shadows';
    } else if (name.includes('骷髏') || name.includes('白骨') || nameEn.includes('Skeleton')) {
      subjectDetail = 'undead skeleton warrior patrol, ancient rusted plate armor, glowing red eye sockets, holding a jagged broadsword standing guard in crypt';
    } else if (name.includes('妖精') || nameEn.includes('Fairy')) {
      subjectDetail = '1girl, tiny dark gothic fairy, black gossamer butterfly wings, gothic ruffled dress, holding a withered black rose, glowing thorns';
    } else if (name.includes('侍女') || name.includes('女僕') || nameEn.includes('Maid')) {
      subjectDetail = '1girl, beautiful anime ghost maid, Victorian black and white maid dress, frilly apron, holding a silver antique candlestick with flickering flame, floating in hallway';
    } else if (name.includes('蝙蝠') || nameEn.includes('Bat')) {
      subjectDetail = 'swarm of crimson vampire bats, ruby red eyes, swirling in spiraling cyclone before an enormous blood-red harvest moon';
    } else if (name.includes('獵犬') || nameEn.includes('Hound')) {
      subjectDetail = 'monstrous shadow hound beast, sleek muscular black fur dissolving into smoky shadow tendrils, glowing violet eyes, baring fangs';
    } else if (name.includes('人偶') || nameEn.includes('Doll')) {
      subjectDetail = '1girl, antique gothic ball-jointed porcelain doll, bronze clockwork gears visible at joints, winding key in back, vintage Victorian lace dress';
    } else if (name.includes('占卜') || nameEn.includes('Divination') || nameEn.includes('Astrologer')) {
      subjectDetail = '1girl, mysterious anime fortune teller astrologer, navy blue hooded velvet cloak with gold constellations, gazing into glowing crystal celestial sphere';
    } else if (name.includes('刺客') || nameEn.includes('Assassin')) {
      subjectDetail = '1girl, lethal gothic anime assassin, form-fitting black leather hood and tunic, wielding twin silver cross daggers, leaping through shadows';
    } else if (name.includes('狂戰士') || name.includes('狂劍士') || nameEn.includes('Berserker')) {
      subjectDetail = '1boy, muscular anime berserker warrior, heavy spiked gothic armor, glowing red eyes, swinging a massive broadsword dripping with crimson energy';
    } else if (name.includes('提琴手') || name.includes('樂師') || nameEn.includes('Violinist')) {
      subjectDetail = '1boy, spectral anime phantom violinist, elegant black tailcoat, playing a translucent glowing silver violin on an empty opera stage, floating music notes';
    } else if (name.includes('驅魔') || name.includes('獵人') || nameEn.includes('Exorcist') || nameEn.includes('Hunter')) {
      subjectDetail = '1boy, cool anime demon hunter, long leather duster coat, holding dual engraved silver hand crossbows, glowing holy runes, gothic ruins';
    } else if (name.includes('血族') || name.includes('貴公子') || nameEn.includes('Noble')) {
      subjectDetail = '1boy, handsome vampire prince, silver hair, red velvet aristocrat coat with gold embroidery, sipping from a crystal wine goblet, moonlit balcony';
    } else if (name.includes('死神') || name.includes('尼克斯') || nameEn.includes('Reaper')) {
      subjectDetail = '1boy, young anime grim reaper acolyte, hooded black cloak, wielding a colossal ornate obsidian scythe, spectral souls swirling around blade';
    } else if (name.includes('魔導書') || nameEn.includes('Grimoire')) {
      subjectDetail = 'ancient forbidden magic grimoire book hovering in midair, thick leather binding with metal clasp, glowing purple pages turning automatically with arcane runes';
    } else if (name.includes('主教') || nameEn.includes('Patriarch')) {
      subjectDetail = '1man, imposing gothic scarlet bishop, ornate red and gold embroidered vestments, holding a gold skull scepter, stained glass cathedral';
    } else if (name.includes('魔女') || name.includes('克萊爾') || nameEn.includes('Enchantress')) {
      subjectDetail = '1girl, beautiful white-haired anime moon enchantress, elegant dark gothic gown, crescent moon staff, floating under a giant full moon';
    } else if (name.includes('墮天') || name.includes('騎士') || name.includes('阿撒茲勒') || nameEn.includes('Paladin')) {
      subjectDetail = '1boy, fallen angel holy knight in dark gothic plate armor, two large black feathered wings, holding a glowing black flame broadsword';
    } else if (name.includes('卡蜜拉') || name.includes('女帝') || nameEn.includes('Camilla')) {
      subjectDetail = '1girl, supreme vampire queen Camilla, flowing crimson gown, black lace veil, crown of rubies, dark bat wings, gothic throne room';
    } else if (name.includes('魔神') || name.includes('阿斯蒙蒂斯') || nameEn.includes('Asmodeus')) {
      subjectDetail = 'towering dark demon lord god, curved obsidian ram horns, dark armored chest with glowing magma veins, seated upon a throne of dark stone';
    } else if (name.includes('倪克斯') || name.includes('夜神') || nameEn.includes('Nyx')) {
      subjectDetail = '1girl, supreme primordial night goddess Nyx, cosmic dress holding a miniature galaxy, floating serenely in the deep starry cosmic void';
    } else {
      subjectDetail = `gothic dark fantasy character ${nameEn}, elaborate dark costume, glowing magical aura, gothic cathedral background`;
    }
  } else if (series === 'neon-district') {
    setting = 'cyberpunk 2077 aesthetic, futuristic neon city, rain-slicked asphalt reflections, glowing cyan and magenta holographic signs, 8k resolution trading card art';

    if (name.includes('無人機') || name.includes('蜂鳥') || nameEn.includes('Drone')) {
      subjectDetail = 'sleek futuristic cybernetic drone with glowing cyan LED thrusters, aerodynamic wings, scanning laser beam, flying over neon city';
    } else if (name.includes('清潔') || name.includes('機器人') || name.includes('瓦利') || nameEn.includes('Cleaner')) {
      subjectDetail = 'compact adorable boxy street cleaner robot, tracks on wheels, glowing yellow headlights, holding a magnetic mechanical broom in rainy neon alley';
    } else if (name.includes('犬') || name.includes('警犬') || nameEn.includes('K9') || nameEn.includes('Hound')) {
      subjectDetail = 'heavily armored robotic police K9 dog, carbon fiber plates, glowing blue optic visor, electric shock sparks crackling from metal jaws';
    } else if (name.includes('外送') || name.includes('滑板') || nameEn.includes('Hoverboard') || nameEn.includes('Courier')) {
      subjectDetail = '1girl, energetic anime cyberpunk rider, wearing oversized neon jacket, riding an anti-gravity hoverboard between towering neon skyscrapers';
    } else if (name.includes('終端') || name.includes('黑客') || nameEn.includes('Terminal')) {
      subjectDetail = 'cluttered underground hacker workbench terminal, multiple glowing computer monitors showing green code, tangle of fiber optic cables';
    } else if (name.includes('貓') || name.includes('妮可') || nameEn.includes('Cat')) {
      subjectDetail = 'adorable white robotic bionic cat, glowing cyan panel lines across body, mechanical joints, curled peacefully on circuit board';
    } else if (name.includes('塗鴉') || nameEn.includes('Spray')) {
      subjectDetail = 'hovering chrome spray-paint sphere drone, spraying bright holographic neon graffiti onto a futuristic skyscraper concrete wall';
    } else if (name.includes('機兵') || name.includes('防暴') || nameEn.includes('Shield Mech')) {
      subjectDetail = 'heavy bipedal police riot mech suit, armored carbon plating, holding a massive hexagonal blue energy forcefield shield';
    } else if (name.includes('光刃') || name.includes('影刃') || nameEn.includes('Shadow Blade')) {
      subjectDetail = '1boy, stealth cyberpunk cyber ninja, black nano-suit, wielding dual high-frequency vibrating plasma blades glowing bright cyan';
    } else if (name.includes('調酒師') || name.includes('琴') || nameEn.includes('Bartender')) {
      subjectDetail = '1girl, stylish anime cyborg bartender, neon blue bob hair, bionic silver arm shaking a glowing cocktail shaker in a futuristic neon bar';
    } else if (name.includes('貨運') || name.includes('機甲') || name.includes('大力神') || nameEn.includes('Cargo')) {
      subjectDetail = 'colossal yellow industrial cargo exoskeleton mech suit, heavy hydraulic pistons, lifting heavy shipping containers at futuristic port';
    } else if (name.includes('偶像') || name.includes('初音') || nameEn.includes('Diva')) {
      subjectDetail = '1girl, holographic virtual anime pop star diva, twin glowing teal pigtails, singing into microphone on a massive stadium holographic stage';
    } else if (name.includes('炮台') || name.includes('防空') || nameEn.includes('Turret')) {
      subjectDetail = 'automated four-barrel futuristic laser anti-air defense turret on skyscraper roof, glowing magenta targeting lasers locking onto sky';
    } else if (name.includes('武士') || name.includes('雷電') || nameEn.includes('Samurai')) {
      subjectDetail = '1boy, cybernetic samurai warrior, sleek dark armor with orange glowing trim, drawing a high-tech lightning plasma katana';
    } else if (name.includes('特戰') || name.includes('瓦爾特') || nameEn.includes('SpecOps')) {
      subjectDetail = '1boy, veteran cyberpunk spec-ops commander, stealth tactical armor, holographic red tactical visor, holding advanced energy assault rifle';
    } else if (name.includes('露娜') || name.includes('神經核心') || nameEn.includes('Neural')) {
      subjectDetail = '1girl, ethereal translucent holographic AI maiden Luna, floating barefoot in rain, glowing blue circuitry lines, digital particles';
    } else if (name.includes('天平') || name.includes('軌道') || nameEn.includes('Railgun')) {
      subjectDetail = '1girl, anime mecha musume maiden, integrated orbital railgun satellite armor on back, firing a devastating blue particle beam from orbit';
    } else if (name.includes('德謬哥') || name.includes('神腦') || nameEn.includes('Demiurge')) {
      subjectDetail = 'colossal biomechanical quantum supercomputer core, pulsating central glowing orb connected by thousands of golden fiber cables';
    } else if (name.includes('夏娃') || name.includes('真夏娃') || nameEn.includes('Eve')) {
      subjectDetail = '1girl, supreme digital goddess Eve, floating in glowing quantum cyberspace, long hair made of starlight data, holding golden digital apple';
    } else {
      subjectDetail = `cyberpunk anime character ${nameEn}, high-tech cybernetic implants, glowing neon jacket, futuristic city backdrop`;
    }
  } else if (series === 'phantom-beasts') {
    setting = 'ethereal fantasy realm, spirit flame auras, celestial starry sky, glowing runic mist, vibrant colors, 8k resolution trading card art';

    if (name.includes('錦鯉') || nameEn.includes('Koi')) {
      subjectDetail = 'mythical rainbow spirit koi fish, scales shining like iridescent opals, swimming gracefully in glowing mountain spring pond with lotus';
    } else if (name.includes('雀') || nameEn.includes('Sparrow')) {
      subjectDetail = 'cute jade-green spirit sparrow bird, emerald feathers, perched peacefully on a slender green bamboo stalk with glowing morning dew';
    } else if (name.includes('鹿') || nameEn.includes('Fawn')) {
      subjectDetail = 'cute baby spirit deer fawn, dappled fur with glowing star markings, tiny golden antlers, standing on soft celestial white clouds';
    } else if (name.includes('倉鼠') || nameEn.includes('Hamster')) {
      subjectDetail = 'adorable round fluffy golden hamster, cheeks crackling with cute golden electric lightning sparks, sparkling eyes, fantasy creature';
    } else if (name.includes('貂') || nameEn.includes('Mink')) {
      subjectDetail = 'sleek pure white spirit mink ferret, bushy tail tip engulfed in bright warm red holy spiritual flames, sitting on mossy stone';
    } else if (name.includes('龜') || nameEn.includes('Tortoise')) {
      subjectDetail = 'mythical miniature glacial tortoise turtle, shell made of pure translucent blue ice crystal, swimming gently in frosty alpine pond';
    } else if (name.includes('蝶') || nameEn.includes('Butterfly')) {
      subjectDetail = 'colossal radiant spirit butterfly, wings resembling glowing stained glass with rainbow gradients, dusting glowing golden powder in night sky';
    } else if (name.includes('狐') || nameEn.includes('Fox') || nameEn.includes('Kitsune')) {
      subjectDetail = 'graceful multi-tailed spirit white kitsune fox, multiple bushy white tails with blue spiritual fire tips, amber eyes, misty bamboo forest';
    } else if (name.includes('隼') || name.includes('雕') || nameEn.includes('Falcon') || nameEn.includes('Roc')) {
      subjectDetail = 'magnificent celestial raptor bird, feathers crackling with golden thunderbolts, soaring powerfully through swirling storm clouds';
    } else if (name.includes('猿') || nameEn.includes('Ape')) {
      subjectDetail = 'colossal red mountain ape spirit, glowing fiery golden eyes, beating muscular chest atop a towering misty mountain pinnacle';
    } else if (name.includes('蛇') || nameEn.includes('Snake') || nameEn.includes('Serpentine')) {
      subjectDetail = '1girl, beautiful anime emerald serpent maiden lamia, upper body of fair maiden, lower body of coiled jade serpent, water lily pond';
    } else if (name.includes('狼') || nameEn.includes('Wolf')) {
      subjectDetail = 'majestic silver-white spirit wolf, silver fur glistening under full moon, howling passionately on snowy rocky mountain peak';
    } else if (name.includes('玄武') || nameEn.includes('Xuanwu')) {
      subjectDetail = 'colossal sacred mythical beast Xuanwu, gigantic armored black dragon-turtle intertwined with a giant spiritual green serpent';
    } else if (name.includes('朱雀') || nameEn.includes('Phoenix') || nameEn.includes('Vermilion')) {
      subjectDetail = 'divine Vermilion Bird Phoenix Zhuque, glorious flaming golden and scarlet plumage, long tail streamers of sacred fire, soaring in crimson dawn';
    } else if (name.includes('應龍') || nameEn.includes('Yinglong')) {
      subjectDetail = 'colossal winged Chinese dragon Yinglong, imperial gold scales, enormous feathered dragon wings spread wide across thunderclouds';
    } else if (name.includes('饕餮') || nameEn.includes('Taotie')) {
      subjectDetail = 'colossal primordial cosmic entity Taotie, terrifying ancient dragon-beast head with gaping maw swallowing stars and galaxies in nebula';
    } else {
      subjectDetail = `magnificent mythical spirit beast ${nameEn}, glowing elemental aura, celestial starry background, fantasy creature illustration`;
    }
  }

  return `masterpiece, best quality, ultra-detailed, official trading card game art, ${subjectDetail}, ${setting}, sharp focus, cinematic volumetric lighting`;
}

// Build the full 414 card catalog
const catalog = {};
let matchedExact = 0;
let generatedCustom = 0;

allCards.forEach(card => {
  const prompt = getSubjectPromptForCard(card);
  catalog[card.id] = {
    id: card.id,
    name: card.name,
    nameEn: card.nameEn,
    series: card.series,
    rarity: card.rarity,
    prompt: prompt
  };
  if (EXACT_PROMPTS[card.id]) {
    matchedExact++;
  } else {
    generatedCustom++;
  }
});

console.log(`Generated prompts catalog for all ${Object.keys(catalog).length} cards.`);
console.log(`Exact bespoke prompts: ${matchedExact}`);
console.log(`Dynamic customized prompts: ${generatedCustom}`);

// Write to JSON
fs.writeFileSync(
  path.resolve('scripts/accurate-prompts.json'),
  JSON.stringify(catalog, null, 2),
  'utf8'
);
console.log('Successfully wrote scripts/accurate-prompts.json!');
