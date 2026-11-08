
import unittest
from datetime import datetime, timedelta, timezone
from filters import filter_by_category, filter_by_age, calculate_distance, filter_by_distance
from filters import filter_by_recency, sort_by_recency, apply_filters

class TestFilters(unittest.TestCase):

    def setUp(self):
        self.postings = [
            {
                "id": 1,
                "category": "Environment",
                "min_age": 14,
                "max_age": None
            },
            {
                "id": 2,
                "category": "Education",
                "min_age": 16,
                "max_age": 18
            },
            {
                "id": 3,
                "category": "Environment",
                "min_age": 18,
                "max_age": 60
            }
        ]

    def test_category_environment(self):
        results = filter_by_category(
            self.postings, "Environment"
        )
        self.assertEqual(
            [p["id"] for p in results], [1, 3]
        )

    def test_category_unknown(self):
        results = filter_by_category(
            self.postings, "Unknown"
        )
        self.assertEqual(results, [])

    def test_age_minimum_boundary(self):
        results = filter_by_age(self.postings, 16)
        self.assertEqual(
            [p["id"] for p in results], [1, 2]
        )

    def test_age_maximum_boundary(self):
        results = filter_by_age(self.postings, 60)
        self.assertEqual(
            [p["id"] for p in results], [1, 3]
        )


    def test_distance_same_location(self):
        distance = calculate_distance(
            49.2606, -123.2460,
            49.2606, -123.2460
        )
        self.assertAlmostEqual(distance, 0.0)

    def test_distance_symmetric(self):
        distance1 = calculate_distance(
            49.2606, -123.2460,
            49.2827, -123.1207
        )
        distance2 = calculate_distance(
            49.2827, -123.1207,
            49.2606, -123.2460
        )
        self.assertAlmostEqual(distance1, distance2)

    def test_filter_by_distance(self):
        postings = [
            {"id": 1, "latitude": 49.2606, "longitude": -123.2460},
            {"id": 2, "latitude": 49.2827, "longitude": -123.1207}
        ]

        results = filter_by_distance(
            postings, 49.2606, -123.2460, 5
        )

        self.assertEqual([p["id"] for p in results], [1])

    def test_distance_zero_distance(self):
        postings = [
            {"id": 1, "latitude": 49.2606, "longitude": -123.2460},
            {"id": 2, "latitude": 49.2827, "longitude": -123.1207}
                ]
        results = filter_by_distance(postings, 49.2606, -123.2460, 0)
        self.assertEqual([p["id"] for p in results], [1])

    
    def test_recency_seven_days(self):
        now = datetime.now(timezone.utc)

        postings = [
            {
                "id": 1,
                "created_at": (now - timedelta(days=2)).isoformat()
            },
            {
                "id": 2,
                "created_at": (now - timedelta(days=10)).isoformat()
            }
        ]

        results = filter_by_recency(postings, 7)

        self.assertEqual([p["id"] for p in results], [1])

    def test_recency_future_posting(self):
        now = datetime.now(timezone.utc)

        postings = [
            {
                "id": 1,
                "created_at": (now + timedelta(days=2)).isoformat()
            }
        ]

        results = filter_by_recency(postings, 7)

        self.assertEqual(results, [])

    def test_recency_no_limit(self):
        postings = [
            {"id": 1, "created_at": "2026-01-01T00:00:00Z"}
        ]

        results = filter_by_recency(postings, None)

        self.assertEqual([p["id"] for p in results], [1])


    def test_sort_newest_first(self):
        postings = [
            {"id": 1, "created_at": "2026-10-01T00:00:00Z"},
            {"id": 2, "created_at": "2026-11-05T00:00:00Z"},
            {"id": 3, "created_at": "2026-10-20T00:00:00Z"}
        ]

        results = sort_by_recency(postings)

        self.assertEqual(
            [p["id"] for p in results],
            [2, 3, 1]
        )

    
    def test_apply_filters_combined(self):
        now = datetime.now(timezone.utc)

        postings = [
            {
                "id": 1,
                "category": "Environment",
                "min_age": 16,
                "max_age": None,
                "latitude": 49.2606,
                "longitude": -123.2460,
                "created_at": (now - timedelta(days=2)).isoformat()
            },
            {
                "id": 2,
                "category": "Education",
                "min_age": 16,
                "max_age": None,
                "latitude": 49.2606,
                "longitude": -123.2460,
                "created_at": (now - timedelta(days=1)).isoformat()
            },
            {
                "id": 3,
                "category": "Environment",
                "min_age": 18,
                "max_age": None,
                "latitude": 49.2606,
                "longitude": -123.2460,
                "created_at": (now - timedelta(days=3)).isoformat()
            },
            {
                "id": 4,
                "category": "Environment",
                "min_age": 16,
                "max_age": None,
                "latitude": 49.2606,
                "longitude": -123.2460,
                "created_at": (now - timedelta(days=10)).isoformat()
            }
        ]

        results = apply_filters(
            postings,
            category="Environment",
            age=16,
            userlat=49.2606,
            userlon=-123.2460,
            distance=5,
            days=7
        )

        self.assertEqual([p["id"] for p in results], [1])


    def test_apply_filters_no_matches(self):
        now = datetime.now(timezone.utc)
    
        postings = [
            {
                "id": 1,
                "category": "Environment",
                "min_age": 16,
                "max_age": None,
                "latitude": 49.2606,
                "longitude": -123.2460,
                "created_at": (now - timedelta(days=2)).isoformat()
            },
            {
                "id": 2,
                "category": "Education",
                "min_age": 16,
                "max_age": None,
                "latitude": 49.2606,
                "longitude": -123.2460,
                "created_at": (now - timedelta(days=1)).isoformat()
            },
            {
                "id": 3,
                "category": "Environment",
                "min_age": 18,
                "max_age": None,
                "latitude": 49.2606,
                "longitude": -123.2460,
                "created_at": (now - timedelta(days=3)).isoformat()
            },
            {
                "id": 4,
                "category": "Environment",
                "min_age": 16,
                "max_age": None,
                "latitude": 49.2606,
                "longitude": -123.2460,
                "created_at": (now - timedelta(days=10)).isoformat()
            }
        ]
    
        results = apply_filters(
            postings,
            category="Healthcare",
            age=16,
            userlat=49.2606,
            userlon=-123.2460,
            distance=5,
            days=7
        )
    
        self.assertEqual(results, [])
        

if __name__ == "__main__":
    unittest.main()