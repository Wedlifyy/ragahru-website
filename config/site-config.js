/* RagaHru site settings.
 *
 * Loaded before every other script. Contact details, messages, prices and
 * the masthead artwork are all set here; templates live in js/templates.js.
 */

const SITE_CONFIG = {
  brandName: "RagaHru",

  /* International format, digits only: 91 followed by the 10-digit number. */
  whatsappNumber: "919380092620",

  instagramUrl: "https://www.instagram.com/ragahru",

  /* Pre-filled WhatsApp messages. {template} becomes a design code, e.g. HN01. */
  enquiryMessage: "Hello RagaHru, I would like to enquire about {template} for our wedding. Could you please share the details and the next steps? Thank you.",
  generalMessage: "Hello RagaHru, I would like to know more about your wedding websites. Could you please share the details? Thank you.",
  customMessage: "Hello RagaHru, I would like to enquire about a custom-designed wedding website. Could you please share the details and the next steps? Thank you.",
  shareMessage: "Have a look at this wedding invitation design, {template}, from RagaHru:",

  /* Price of a custom-designed website, in rupees. */
  customPrice: 1499,

  /* Shown beside the reduced price in the large preview. Set to "" when the
     sale ends. The sale bar itself is edited in index.html. */
  saleLabel: "Season sale",

  /* A template shows a "New" badge for this many days after its createdAt. */
  newForDays: 21,

  /* Masthead background: three rows of posters drifting behind the headline.
     Portrait 2:3, about 400 x 600. Add or remove lines freely. */
  heroRail: [
    "assets/hero/rail/poster-01.jpg",
    "assets/hero/rail/poster-02.jpg",
    "assets/hero/rail/poster-03.jpg",
    "assets/hero/rail/poster-04.jpg",
    "assets/hero/rail/poster-05.jpg",
    "assets/hero/rail/poster-06.jpg",
    "assets/hero/rail/poster-07.jpg",
    "assets/hero/rail/poster-08.jpg",
    "assets/hero/rail/poster-09.jpg",
    "assets/hero/rail/poster-10.jpg"
  ],

  /* The three phones in the masthead, in order: left, centre, right.
     Portrait 9:19.5, about 420px wide. index.html preloads the centre one. */
  heroPhonePosters: [
    "assets/hero/posters/phone-01.jpg",
    "assets/hero/posters/phone-02.jpg",
    "assets/hero/posters/phone-03.jpg"
  ],

  /* Notes from real couples, shown above Questions. The section stays hidden
     while this is empty. Only use words a couple sent you, with permission.
       { quote: "...", name: "Ananya & Rohit", place: "Mysuru", design: "HN01" }
     quote and name are required; place and design are optional. */
  testimonials: [],

  /* Catalogue sections, in page order. `code` prefixes a template's code when
     its folder is not already named like HN01. A collection used in
     js/templates.js but missing here still renders, after these. */
  collections: [
    { key: "hindu",     label: "Hindu weddings",     code: "HN" },
    { key: "christian", label: "Christian weddings", code: "CH" },
    { key: "islamic",   label: "Islamic weddings",   code: "IS" }
  ]
};
