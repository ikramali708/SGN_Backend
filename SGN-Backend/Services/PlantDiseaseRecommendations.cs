namespace SGN_Backend.Services;

/// <summary>
/// Maps PlantVillage-style class labels to concise treatment and prevention guidance (informational, not a substitute for professional diagnosis).
/// </summary>
public static class PlantDiseaseRecommendations
{
    private static readonly IReadOnlyDictionary<string, (string Treatment, string Prevention)> Map =
        new Dictionary<string, (string, string)>(StringComparer.Ordinal)
        {
            ["Apple___Apple_scab"] = (
                "Remove infected leaves and fruit; prune for airflow. Apply fungicides labeled for apple scab (e.g. captan, myclobutanil) per manufacturer timing.",
                "Rake and destroy fallen leaves. Choose resistant cultivars where possible. Avoid prolonged leaf wetness from overhead irrigation."),
            ["Apple___Black_rot"] = (
                "Prune out dead wood and mummified fruit; burn or dispose off-site. Apply fungicides during spring infection periods as labeled for black rot.",
                "Sanitize tools; remove wild brambles nearby. Improve canopy drying; maintain orchard sanitation before bud break."),
            ["Apple___Cedar_apple_rust"] = (
                "Apply protective fungicides on apple from pink through early summer per local extension schedules. Remove nearby alternate hosts if feasible.",
                "Separate new plantings from eastern red cedar/juniper hosts where practical; use resistant varieties in high-risk areas."),
            ["Apple___healthy"] = (
                "No disease treatment needed. Maintain balanced fertilization, irrigation, and monitoring for early signs of stress or pests.",
                "Annual pruning, mulch to moderate soil temperature, scout regularly, and keep records of seasonal issues."),
            ["Blueberry___healthy"] = (
                "Continue good cultural care: acidic soil pH, organic mulch, and adequate water during fruit set.",
                "Avoid root disturbance; net against birds; monitor for mummy berry and scale seasonally."),
            ["Cherry_(including_sour)___Powdery_mildew"] = (
                "Apply sulfur or registered fungicides at label intervals; improve air movement. Remove heavily infected shoots after harvest.",
                "Avoid excessive nitrogen; prune for openness; irrigate at soil level to limit humid microclimate on leaves."),
            ["Cherry_(including_sour)___healthy"] = (
                "Maintain vigor with proper pruning and nutrition. Monitor for bacterial canker, brown rot, and insect pests during bloom.",
                "Sanitize pruning tools; remove diseased wood promptly; choose site with good drainage and air flow."),
            ["Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot"] = (
                "Rotate fungicides with different FRAC groups if spraying; scout lower canopy. Ensure adequate potassium fertility.",
                "Rotate crops away from corn; till residue where appropriate; select hybrids with good gray leaf spot tolerance."),
            ["Corn_(maize)___Common_rust_"] = (
                "Foliar fungicide may be warranted if rust is active before dough stage and conditions favor spread—follow local thresholds.",
                "Plant tolerant hybrids; avoid late planting in high-risk windows when practical."),
            ["Corn_(maize)___Northern_Leaf_Blight"] = (
                "Apply fungicide if lesions reach upper leaves before critical yield stages per extension guidelines.",
                "Crop rotation; bury or manage residue; choose hybrids with strong NLB ratings."),
            ["Corn_(maize)___healthy"] = (
                "No foliar disease treatment needed. Maintain balanced NPK and adequate soil moisture through silking.",
                "Rotate crops; control weeds that host pathogens; scout for early leaf lesions."),
            ["Grape___Black_rot"] = (
                "Remove mummies from vines; apply fungicide program from bud break through bloom as labeled for black rot.",
                "Open canopy for drying; remove infected clusters early; maintain sanitation in vineyard floor."),
            ["Grape___Esca_(Black_Measles)"] = (
                "There is no cure—remove symptomatic wood well below symptoms and destroy prunings. Retrain cordons if needed.",
                "Avoid large pruning wounds; paint or seal major cuts; delay heavy pruning until late winter; promote vine balance."),
            ["Grape___Leaf_blight_(Isariopsis_Leaf_Spot)"] = (
                "Apply registered fungicides during periods of warm, wet weather; remove severely blighted leaves to improve spray coverage.",
                "Improve canopy airflow; manage irrigation to reduce leaf wetness duration."),
            ["Grape___healthy"] = (
                "Maintain routine canopy management and a preventive disease program suited to your region and cultivar.",
                "Monitor for powdery mildew, downy mildew, and botrytis; keep records of weather-driven risk periods."),
            ["Orange___Haunglongbing_(Citrus_greening)"] = (
                "No cure—remove severely declining trees to reduce psyllid reservoirs. Follow regional HLB management plans for nutrition and vector control.",
                "Control Asian citrus psyllid; use certified budwood; scout new flush; coordinate with agricultural extension."),
            ["Peach___Bacterial_spot"] = (
                "Apply copper or antibiotics only where legally permitted and per local program; avoid excessive fruit thinning wounds during wet periods.",
                "Select resistant cultivars/rootstocks; avoid overhead irrigation; improve airflow; remove infected twigs when dry."),
            ["Peach___healthy"] = (
                "Maintain dormant fungicide/insecticide programs as recommended locally; monitor for curl, scab, and borers.",
                "Prune annually; remove mummies; manage orchard floor vegetation."),
            ["Pepper,_bell___Bacterial_spot"] = (
                "Apply copper-based products preventively; avoid working wet foliage. Remove heavily infected plants in home gardens.",
                "Use certified seed/transplants; rotate crops; drip irrigation; avoid splash from soil."),
            ["Pepper,_bell___healthy"] = (
                "Scout for aphids and thrips (virus vectors); maintain even soil moisture and calcium to reduce blossom-end rot risk.",
                "Mulch soil; stake plants; sanitize tools between plants."),
            ["Potato___Early_blight"] = (
                "Apply fungicides on a protectant schedule after row closure if lesions appear; ensure adequate nitrogen and irrigation.",
                "Rotate away from solanaceae; destroy cull piles; use certified seed; hilling to cover tubers."),
            ["Potato___Late_blight"] = (
                "Apply late-blight-specific fungicides immediately when risk is high; destroy infected vines to protect tubers.",
                "Use resistant varieties where available; avoid overhead irrigation; hill soil; harvest when skins are set; store dry."),
            ["Potato___healthy"] = (
                "No disease treatment needed. Monitor for early blight, late blight, and Colorado potato beetle.",
                "Certified seed; rotation; proper hilling; avoid excessive irrigation on foliage."),
            ["Raspberry___healthy"] = (
                "Prune floricanes after harvest; maintain narrow rows; irrigate at base to reduce fruit rot risk.",
                "Scout for spur blight, cane borers, and viruses; remove weak canes."),
            ["Soybean___healthy"] = (
                "Continue IPM scouting for aphids, stink bugs, and foliar diseases during pod fill.",
                "Rotate crops; select varieties suited to local disease pressure; plant at recommended populations."),
            ["Squash___Powdery_mildew"] = (
                "Apply labeled fungicides or horticultural oils/bicarbonates early at first spots; protect new growth.",
                "Choose resistant cultivars; space plants; avoid excess nitrogen; irrigate at soil level."),
            ["Strawberry___Leaf_scorch"] = (
                "Remove old infected leaves after renovation; apply fungicides during establishment and bloom per label for leaf spot complex.",
                "Use certified plants; mulch with clean straw; improve airflow; avoid overhead watering."),
            ["Strawberry___healthy"] = (
                "Renovate beds annually; maintain fertility and irrigation for steady growth without excess lushness.",
                "Remove runners as needed; scout for mites and botrytis during bloom."),
            ["Tomato___Bacterial_spot"] = (
                "Apply copper + mancozeb where labeled; avoid overhead irrigation; do not work wet plants. Remove severely infected plants in small plots.",
                "Use disease-free transplants; rotate crops; mulch to reduce soil splash; sanitize stakes and tools."),
            ["Tomato___Early_blight"] = (
                "Apply protectant fungicides after first lesions; stake plants; remove lowest leaves touching soil if infection is heavy.",
                "Mulch; rotate; ensure spacing and ventilation; avoid excessive leaf wetness."),
            ["Tomato___Late_blight"] = (
                "Apply late-blight-active fungicides during alert periods; destroy infected tissue quickly to slow spread in garden settings.",
                "Use resistant varieties; avoid cull piles near tomatoes/potatoes; improve airflow; water at base."),
            ["Tomato___Leaf_Mold"] = (
                "Improve greenhouse/hoop house ventilation and dehumidification; apply labeled fungicides for leaf mold.",
                "Increase row spacing; avoid prolonged high humidity; remove heavily infected lower leaves when dry."),
            ["Tomato___Septoria_leaf_spot"] = (
                "Apply protectant fungicides; remove infected lower leaves to reduce inoculum; mulch soil to limit splash.",
                "Rotate; stake; avoid overhead water; destroy debris at season end."),
            ["Tomato___Spider_mites Two-spotted_spider_mite"] = (
                "Rinse foliage to knock mites down; release or conserve predatory mites where appropriate; use labeled miticides if thresholds exceeded.",
                "Avoid dusty conditions and drought stress; do not over-fertilize with nitrogen; scout undersides of leaves."),
            ["Tomato___Target_Spot"] = (
                "Improve airflow; apply broad-spectrum fungicides per label; remove heavily infected leaves in severe cases.",
                "Rotate; mulch; stake; reduce leaf wetness duration."),
            ["Tomato___Tomato_Yellow_Leaf_Curl_Virus"] = (
                "There is no cure—remove infected plants to reduce whitefly transmission. Control whiteflies with integrated tactics per local guidance.",
                "Use resistant varieties; fine mesh for seedlings; reflective mulches; manage weeds that harbor whiteflies."),
            ["Tomato___Tomato_mosaic_virus"] = (
                "Remove infected plants; control aphids as vectors; disinfect tools and hands after contact with infected tissue.",
                "Use certified seed/transplants; avoid tobacco use near plants; wash hands before handling seedlings."),
            ["Tomato___healthy"] = (
                "No disease treatment needed. Stake or cage; consistent watering reduces cracking and blossom-end rot risk.",
                "Mulch; rotate; scout early; remove lower leaves judiciously for airflow without sunscald."),
            ["Unknown"] = (
                "Could not map a known disease label. Consult a local agricultural extension or plant pathologist with a physical sample if symptoms persist.",
                "Provide good drainage, avoid overwatering, improve light and airflow, and keep records of symptoms and weather."),
        };

    public static (string Treatment, string Prevention) Get(string diseaseName)
    {
        if (string.IsNullOrWhiteSpace(diseaseName))
            return Map["Unknown"];

        if (Map.TryGetValue(diseaseName, out var pair))
            return pair;

        if (diseaseName.Contains("healthy", StringComparison.OrdinalIgnoreCase))
            return (
                "No specific disease treatment indicated. Continue balanced watering, nutrition, and routine scouting.",
                "Maintain sanitation, proper spacing, mulch where helpful, and monitor for early symptoms.");

        return (
            "Isolate affected plants if possible; improve airflow and reduce leaf wetness. Seek local extension advice for confirmation and labeled products.",
            "Rotate crops where applicable; use clean media and transplants; avoid overhead irrigation; remove plant debris at season end.");
    }
}
