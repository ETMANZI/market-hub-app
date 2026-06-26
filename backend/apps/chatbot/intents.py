# chatbot/intents.py - English and Kinyarwanda only

# ENGLISH Intents
INTENTS_EN = {
    "greeting": {
        "patterns": ["hello", "hi", "hey", "good morning", "good afternoon", "hi there"],
        "responses": [
            "Hello! 👋 How can I help you with Market Hub today?",
            "Hi there! Welcome to Market Hub Support. What can I assist you with?",
            "Hey! I'm here to help you with listings, subscriptions, or any questions you have."
        ]
    },
    "pricing": {
        "patterns": ["how much", "price", "cost", "pricing", "fee", "charges"],
        "responses": [
            "Market Hub offers flexible subscription plans:\n\n• Basic: 1,500 RWF/month - 3 listings, 1 image per listing\n• Classic: 2,000 RWF/month - 3 listings, 2 images per listing\n• Premium: 3,000 RWF/month - 4 listings, 3 images per listing\n• Business: 4,000 RWF/month - 5 listings, 4 images per listing\n\nWhich plan interests you?"
        ]
    },
    "how_to_post": {
        "patterns": ["post listing", "create listing", "sell", "add listing", "how to post", "list item"],
        "responses": [
            "To post a listing:\n\n1️⃣ Click the 'Post Listing' button in the sidebar\n2️⃣ Fill in your listing details (title, description, price)\n3️⃣ Upload clear photos of your item\n4️⃣ Choose your listing type (House, Car, Product, etc.)\n5️⃣ Click 'Publish'\n\nNeed a subscription? Check our plans first!"
        ]
    },
    "subscription": {
        "patterns": ["subscribe", "subscription", "plan", "upgrade", "membership", "premium"],
        "responses": [
            "You can view all subscription plans on the Subscriptions page. Each plan offers different benefits:\n\n• Basic: 2 listings, 1 image\n• Classic: 3 listings, 2 images + business ads\n• Premium: 4 listings, 3 images + analytics\n• Business: 5 listings, 4 images + priority support\n\nWould you like me to help you choose a plan?"
        ]
    },
    "image_requirements": {
        "patterns": ["image", "photo", "picture", "upload photo", "image size"],
        "responses": [
            "Image guidelines:\n\n📸 Use clear, well-lit photos\n📏 Minimum size: 800x600 pixels\n💾 Maximum file size: 10MB per image\n🖼️ Supported formats: PNG, JPG, WEBP, GIF\n📷 Show multiple angles\n🚫 No watermarks or text on images\n\nYour plan determines how many images you can upload per listing."
        ]
    },
    "payment": {
        "patterns": ["payment", "pay", "mobile money", "mtn", "airtel", "transfer"],
        "responses": [
            "We accept multiple payment methods:\n\n💰 Mobile Money (MTN, Airtel)\n💳 Credit/Debit Cards\n🏦 Bank Transfer\n\nAfter subscribing, you'll receive payment instructions. All payments are securely processed."
        ]
    },
    "account": {
        "patterns": ["account", "profile", "change password", "update email", "delete account"],
        "responses": [
            "You can manage your account from the Dashboard:\n\n• Update profile information\n• Change password\n• View your listings\n• Track interested buyers\n• Manage notifications\n\nIs there something specific you'd like to update?"
        ]
    },
    "contact_support": {
        "patterns": ["support", "help", "contact", "talk to human", "agent", "customer service"],
        "responses": [
            "You can reach our support team:\n\n📞 Call: +250 788 263 338\n💬 WhatsApp: wa.me/250788263338\n✉️ Email: support@markethub.com\n\nOr visit our Help section for guides and FAQs. Would you like me to connect you with a human agent?"
        ]
    },
    "listing_approval": {
        "patterns": ["approve", "pending", "review", "how long", "approval time"],
        "responses": [
            "Listings are typically approved within 24 hours. Premium and Business subscribers get priority approval within 4 hours.\n\nYou'll receive a notification once your listing is approved. Need faster approval? Consider upgrading your subscription!"
        ]
    },
    "refund": {
        "patterns": ["refund", "money back", "return", "cancel subscription"],
        "responses": [
            "Subscription fees are generally non-refundable. However, if you experienced technical issues, please contact our support team within 7 days of payment.\n\nTo cancel auto-renewal, go to Subscriptions → Manage → Turn off auto-renew."
        ]
    },
    "featured_listing": {
        "patterns": ["featured", "boost", "promote", "advertise", "highlight"],
        "responses": [
            "Featured listings appear at the top of search results! 🚀\n\nPremium and Business plans include featured listing options. You can upgrade from the Subscriptions page to get more visibility for your items."
        ]
    },
    "business_ads": {
        "patterns": ["business ad", "company", "business account", "sell for business"],
        "responses": [
            "Business ads are available with Classic, Premium, and Business plans.\n\nBenefits:\n• Reach more customers\n• Company branding\n• Analytics dashboard\n• Priority support\n\nUpgrade your plan to start posting business ads!"
        ]
    },
    "analytics": {
        "patterns": ["analytics", "stats", "views", "interested", "performance"],
        "responses": [
            "Your dashboard shows:\n\n👁️ Views - How many people saw your listing\n⭐ Interested - Potential buyers\n📈 Trends - Performance over time\n\nPremium and Business plans include advanced analytics with detailed insights!"
        ]
    },
    "goodbye": {
        "patterns": ["bye", "goodbye", "see you", "thanks", "thank you"],
        "responses": [
            "You're welcome! 👋 Feel free to come back if you have more questions. Happy selling on Market Hub!",
            "Glad I could help! Have a great day! 🌟"
        ]
    },
    "help": {
        "patterns": ["help", "what can you do", "features", "capabilities"],
        "responses": [
            "I can help you with:\n\n📋 Posting listings\n💰 Pricing and subscriptions\n📸 Image guidelines\n✅ Listing approval\n📊 Analytics and stats\n🆘 Technical support\n🔐 Account management\n\nWhat would you like to know?"
        ]
    },
    "default": {
        "responses": [
            "I'm not sure I understand. Could you rephrase your question?\n\nYou can ask me about:\n• How to post a listing\n• Subscription plans\n• Image requirements\n• Pricing\n• Account help\n\nOr type 'help' to see all options."
        ]
    }
}

# KINYARWANDA Intents
INTENTS_RW = {
    "greeting": {
        "patterns": ["muraho", "bite", "mwiriwe", "sawa", "mwaramutse", "mwiriwe", "umunsi mwiza"],
        "responses": [
            "Muraho! 👋 Nigute nakugufasha kuri Market Hub uyumunsi?",
            "Mwiriwe! Murakaza neza kuri Market Hub Support. Ni iki nakugirira akamaro?",
            "Yoo! Ndi hano kugira ngo nkugufashe mu matangazo, kwiyandikisha, cyangwa ibibazo ufite."
        ]
    },
    "pricing": {
        "patterns": ["angahe", "igiciro", "ibiciro", "amafaranga", "kodi", "ibishyo"],
        "responses": [
            "Market Hub itanga gahunda z'iyandikishwa rikoze:\n\n• Basic: 1,500 FRW/Ukwezi - 3 matangazo, ishusho 1 kuri buri tangazo\n• Classic: 2,000 FRW/Ukwezi - 3 matangazo, ishusho 2 kuri buri tangazo\n• Premium: 3,000 FRW/Ukwezi - 4 matangazo, ishusho 3 kuri buri tangazo\n• Business: 4,000 FRW/Ukwezi - 5 matangazo, ishusho 4 kuri buri tangazo\n\nNi iyihe gahunda igukundisha?"
        ]
    },
    "how_to_post": {
        "patterns": ["tangaza", "kota tangazo", "gurisha", "ongera itangazo", "kota", "ishyira ahagaragara", "kwandika itangazo"],
        "responses": [
            "Kugira ngo utangaze:\n\n1️⃣ Kanda kuri 'Tangaza' kuruhande\n2️⃣ Uzuze ibyangombwa (umutwe, ibisobanuro, igiciro)\n3️⃣ Shyiramo amashusho meza y'ibyo ugurisha\n4️⃣ Hitamo ubwoko bw'itangazo (Inzu, Imodoka, Ibicuruzwa, nk.)\n5️⃣ Kanda 'Sohora'\n\nUkeneye kwiyandikisha? Reba gahunda zacu mbere!"
        ]
    },
    "subscription": {
        "patterns": ["kwiyandikisha", "iyandikishwa", "gahunda", "kuzamura", "ubumembari", "premium", "abonementi"],
        "responses": [
            "Urashobora kureba gahunda zose z'iyandikishwa ku rupapuro rw'Iyandikishwa. Buri gahunda itanga amahirwe atandukanye:\n\n• Basic: 2 matangazo, ishusho 1\n• Classic: 3 matangazo, ishusho 2 + amatangazo y'abucuruzi\n• Premium: 4 matangazo, ishusho 3 + ibibarwa\n• Business: 5 matangazo, ishusho 4 + ubufasha bwihutirwa\n\nUrashaka nkugufashe guhitamo gahunda?"
        ]
    },
    "image_requirements": {
        "patterns": ["ishusho", "ifoto", "amashusho", "gushyiramo ifoto", "ubunini bw'ishusho", "ingano y'ishusho"],
        "responses": [
            "Amabwiriza y'amashusho:\n\n📸 Koresha amashusho meza, afite urumuri\n📏 Ubunini ntarengwa: 800x600 pixels\n💾 Ingano ntarengwa: 10MB kuri buri shusho\n🖼️ Ubwoko bukwirakwizwa: PNG, JPG, WEBP, GIF\n📷 Werekanwe impande zitandukanye\n🚫 Nta kirango cyangwa inyandiko ku mashusho\n\nGahunda yawe igena amashusho runaka ushobora gushyira kuri buri gicuruzwa."
        ]
    },
    "payment": {
        "patterns": ["kwishyura", "ishyura", "mobile money", "mtn", "airtel", "kwimura", "amafaranga yishyuwe"],
        "responses": [
            "Kugeza ubu twemera uburyo bumwe bwo kwishyura:\n\n💰 Mobile Money (MTN) kuri numero musanga kurubuga\n💳 Amakarita yo kwishyura\n🏦 Gyukoresha Bank bizmera nyuma\n\nNyuma yo kwiyandikisha, Igicuruzwa cyawe kigaragara nyuma yo kwishyura."
        ]
    },
    "account": {
        "patterns": ["konti", "porofile", "hindura ijambo banga", "vandura imeri", "siba konti", "gucunga konti"],
        "responses": [
            "Urashobora gucunga konti yawe kuri Dashboard:\n\n• Guhindura amakuru y'umwirondoro\n• Hindura ijambo banga\n• Reba ibyo utangaje\n• Kurikirana abaguzi\n• Genga notifikasiyo\n\nHari ikintu runaka ushaka guhindura?"
        ]
    },
    "contact_support": {
        "patterns": ["ubufasha", "fasha", "twandikire", "vugisha umuntu", "umukozi", "serivisi y'abakiriya", "support"],
        "responses": [
            "Ushobora kuvugana n'itsinda ryacu ry'ubufasha:\n\n📞 Guhamagara: +250 788 263 338\n💬 WhatsApp: wa.me/250788263338\n✉️ Imeri: support@markethub.com\n\nCyangwa sura Igice cy'Ubufasha kubijyanye n'ibibazo bikunze kubazwa. Urashaka nkuguhuza n'umukozi?"
        ]
    },
    "listing_approval": {
        "patterns": ["kwemera", "gitegereje", "gusuzuma", "igihe kingana iki", "igihe cyo kwemera", "itangazo ryoherejwe"],
        "responses": [
            "Igicuruzwa risuzumwa mu minota 20. Abiyandikishije kuri Premium na Business babona ubufasha bwihutirwa mu minota 10.\n\nUzakira notifikasiyo iyo igicuruzwa ryemerewe. Ukeneye ubufasha bwihutirwa? Tekereza kuzamura gahunda yawe!"
        ]
    },
    "refund": {
        "patterns": ["kusubiza amafaranga", "garura amafaranga", "garuka", "guhagarika kwiyandikisha", "kwishyuza"],
        "responses": [
            "Amafaranga y'iyandikishwa ntabwo asubizwa. Nyamara, niba wagize ikibazo gikorana na tekinoloji, twandikire, itsinda ry'ubufasha mu minsi 3 nyuma yo kwishyura.\n\nKugira ngo uhagarike kwiyandikisha kwikora, jya ku Iyandikishwa → Genga."
        ]
    },
    "featured_listing": {
        "patterns": ["mu mwanya mbere", "gushimangira", "kwamamaza", "kwerekana", "garagaza", "itangazo ryambere"],
        "responses": [
            "Igicuruzwa kiri mu mwanya mbere riragaragara ku isonga ry'ibisubizo! 🚀\n\nGahunda za Premium na Business zirimo ibicuruzwa bya mbere. Urashobora kuzamura gahunda yawe ku rupapuro rw'Iyandikishwa kugira ngo ibintu byawe bigaragare cyane."
        ]
    },
    "business_ads": {
        "patterns": ["itangazo ry'ubucuruzi", "isosiyete", "konti y'ubucuruzi", "gurishira ubucuruzi", "kwamamaza ibicuruzwa"],
        "responses": [
            "Amatangazo y'ubucuruzi arahari kuri gahunda za Classic, Premium, na Business.\n\nInyungu:\n• Kugera ku bakiriya benshi\n• Kwerekana izina rya sosiyete\n• Ibibarwa kuri dashboard\n• Ubufasha bwihutirwa\n\nZamura gahunda yawe kugira ngo utangire gutanga amatangazo y'ubucuruzi!"
        ]
    },
    "analytics": {
        "patterns": ["ibibarwa", "ibarura", "abarebye", "bashishikaye", "imikorere", "statistiki"],
        "responses": [
            "Dashboard yawe yerekana:\n\n👁️ Abarebye - Ni bangahe barebye itangazo ryawe\n⭐ Bashishikaye - Abaguzi bishoboka\n📈 Imikorere - Uko bigenda mu gihe\n\nGahunda za Premium na Business zirimo ibibarwa bihanitse bifite amakuru arambuye!"
        ]
    },
    "goodbye": {
        "patterns": ["muraho", "reba", "turabonana", "urakoze", "murakoze", "ngaho", "komeza"],
        "responses": [
            "Urakaze! 👋 Urahemerewe kugaruka niba ufite ibibazo byinshi. Ugurishe neza kuri Market Hub!",
            "Urakoze cyane! Ugire umunsi mwiza! 🌟"
        ]
    },
    "help": {
        "patterns": ["fasha", "iki ukora", "ibyo ushobora", "ubushobozi", "mfasha", "nkugirire akamaro"],
        "responses": [
            "Ndagufasha kubijyanye na:\n\n📋 Gutangaza\n💰 Ibiciro no kwiyandikisha\n📸 Amabwiriza y'amashusho\n✅ Kwemera itangazo\n📊 Ibarura na statistiki\n🆘 Ubufasha bwa tekinoloji\n🔐 Gucunga konti\n\nNi iki ushaka kumenya?"
        ]
    },
    "default": {
        "responses": [
            "Sinumva neza. Ushobora gusubiramo ikibazo mu bundi buryo?\n\nUrashobora kumbaza ibijyanye na:\n• Uko utangaza\n• Gahunda z'iyandikishwa\n• Amabwiriza y'amashusho\n• Ibiciro\n• Ubufasha kuri konti\n\nCyangwa anda 'fasha' kugira ngo urebe ibihitamo byose."
        ]
    }
}

# Language mapping
LANGUAGES = {
    'en': INTENTS_EN,
    'rw': INTENTS_RW
}

def get_intent(message, language='en'):
    """Get intent from message based on selected language"""
    message_lower = message.lower()
    intents = LANGUAGES.get(language, INTENTS_EN)
    
    for intent, data in intents.items():
        if intent == "default":
            continue
        for pattern in data.get("patterns", []):
            if pattern in message_lower:
                return intent
    return "default"

def get_response(intent, language='en'):
    """Get response for intent in selected language"""
    import random
    intents = LANGUAGES.get(language, INTENTS_EN)
    responses = intents[intent].get("responses", intents["default"]["responses"])
    return random.choice(responses)