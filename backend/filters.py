import math
from datetime import datetime, timedelta, timezone

# Temporary Volunteer Posting for Testing
postings = [
    {
        "id": 1,
        "title": "Park Clean Up",
        "category": "Environment",
        "created_at": "2026-11-05T14:30:00Z",
        "description": "Clean up at the park",
        "min_age": 14,
        "max_age": None,
        "latitude": 49.3017,
        "longitude": -123.1232,
        "organizer": "Government of Vancouver",
        "contact": "abcdefgvan@gmail.com",
        "organizer": "Government of Vancouver",
        "contact": "abcdefgvan@gmail.com",
        "link": "https://example.com"
    },
    {
        "id": 2,
        "title": "Community Tutoring",
        "category": "Education",
        "created_at": "2026-11-01T14:30:00Z",
        "description": "Tutor children who needs help with math",
        "min_age": 16,
        "max_age": None,
        "latitude": 49.2207,
        "longitude": -123.1141,
        "organizer": "Government of Vancouver",
        "contact": "abcdefgvan23@gmail.com",
        "link": "https://example2.com"
    },
    {
        "id": 3,
        "title": "5k Race Event Staff",
        "category": "Event",
        "created_at": "2026-10-20T14:30:00Z",
        "description": "Support with organization of event",
        "min_age": 18,
        "max_age": 60,
        "latitude": 49.2707,
        "longitude": -123.1351,
        "organizer": "Government of Vancouver",
        "contact": "abcdefgvan34@gmail.com",
        "link": "https://example3.com"
    },
    {
        "id": 4,
        "title": "Beach Clean Up",
        "category": "Environment",
        "created_at": "2026-09-15T14:30:00Z",
        "description": "Clean up at the beach",
        "min_age": 16,
        "max_age": None,
        "latitude": 49.2736,
        "longitude": -123.1561,
        "organizer": "Government of Vancouver",
        "contact": "abcdefgvan56@gmail.com",
        "link": "https://example4.com"
    }   
]


def filter_by_category(postings, category):
    results = []
    for post in postings:
        if post["category"] == category:
            results.append(post)
    return results

def filter_by_age(postings, age):
    results = []
    for post in postings:
        if ((post["min_age"] is None or post["min_age"] <= age)
            and (post["max_age"] is None or age <= post["max_age"])):
            results.append(post)
    return results

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371 #Earth's approximate radius in km

    #convert degrees to radians
    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    #calculate lat and lon differences
    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1

    # calculate haversine and calculate distance based off that
    a = (math.sin(delta_lat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lon / 2) ** 2)
    d = 2*R*math.asin(math.sqrt(a))
    return d

def filter_by_distance(posting, userlat, userlon, radius_km):
    results = []
    for post in posting:
        distance = calculate_distance(userlat, userlon, post["latitude"], post["longitude"])
        if (distance <= radius_km):
            results.append(post)
    return results

def filter_by_recency(postings, days):
    if days is None:
        return postings
    if days < 0:
        raise ValueError("Days cannot be negative")
    results = []
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=days)
    for post in postings:
        created_at = datetime.fromisoformat(post["created_at"].replace("Z", "+00:00"))
        if created_at >= cutoff and created_at <= now:
            results.append(post)
    return results

def sort_by_recency(postings):
    results = sorted(postings, key=lambda post: post["created_at"], reverse=True)
    return results

def apply_filters(postings, category = None, age = None, 
                  userlat = None, userlon = None, distance = None, days = None):
    results = postings
    if category is not None:
        results = filter_by_category(results, category)
    if age is not None:
        results = filter_by_age(results, age)
    if (userlat is not None and userlon is not None and distance is not None):
        results = filter_by_distance(results, userlat, userlon, distance)
    if days is not None:
        results = filter_by_recency(results, days)
    results = sort_by_recency(results)
    return results