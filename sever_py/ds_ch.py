import requests
import json
import time

# Step 1: Fetch all problems from LeetCode
def fetch_all_problems():
    url = "https://leetcode.com/api/problems/all/"
    response = requests.get(url)
    data = response.json()
    return data.get("stat_status_pairs", [])

# Step 2: For a given title slug, fetch its subtopics via GraphQL
def fetch_subtopics(title_slug):
    graphql_url = "https://leetcode.com/graphql"
    query = """
    query getQuestionDetail($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        topicTags {
          name
          slug
          translatedName
        }
      }
    }
    """
    variables = {"titleSlug": title_slug}
    payload = {
        "query": query,
        "variables": variables
    }
    
    response = requests.post(graphql_url, json=payload)
    if response.status_code == 200:
        json_data = response.json()
        question_data = json_data.get("data", {}).get("question", {})
        # Return list of tag names if available, else an empty list
        if question_data and "topicTags" in question_data:
            return [tag["name"] for tag in question_data["topicTags"]]
    return []

def main():
    problems = fetch_all_problems()
    mapping = {}
    
    # Iterate over each problem
    for problem in problems:
        stat = problem.get("stat", {})
        question_number = stat.get("frontend_question_id")
        title_slug = stat.get("question__title_slug")
        
        if question_number and title_slug:
            print(f"Fetching subtopics for Question {question_number}: {title_slug}")
            subtopics = fetch_subtopics(title_slug)
            mapping[question_number] = subtopics
            # Adding a short delay to be polite with the server
            time.sleep(0.2)
    
    # Write mapping to subtopic.json file
    with open("subtopic.json", "w") as outfile:
        json.dump(mapping, outfile, indent=4)
    
    print("Mapping saved to subtopic.json")

if __name__ == "__main__":
    main()
