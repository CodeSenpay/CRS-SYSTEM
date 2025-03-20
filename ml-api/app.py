from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "Student Clustering ML API is running",
        "version": "1.0.0"
    })

@app.route('/cluster', methods=['POST'])
def cluster_students():
    try:
        # Step 1: Get data from request 
        request_data = request.get_json()
        
        if not request_data or 'grades' not in request_data:
            return jsonify({"error": "No grades data provided in request"}), 400
            
        grades = request_data['grades']
        
        # Validate that grades is a list
        if not isinstance(grades, list) or len(grades) == 0:
            return jsonify({"error": "Grades data must be a non-empty list"}), 400
            
        # Validate required fields in each grade record
        required_fields = ['student_number', 'subject_code', 'score', 'semester', 'year']
        for grade in grades:
            if not all(field in grade for field in required_fields):
                return jsonify({"error": f"Each grade record must contain: {', '.join(required_fields)}"}), 400
        
        # Convert to DataFrame
        df = pd.DataFrame(grades)
        
        # Print score data types before conversion
        print("Score data types before conversion:")
        print(df['score'].apply(type).value_counts())
        print("Score min/max before conversion:", df['score'].min(), df['score'].max())
        
        # Ensure score is numeric
        df['score'] = pd.to_numeric(df['score'], errors='coerce')
        
        # Print after conversion
        print("Score min/max after conversion:", df['score'].min(), df['score'].max())
        print("Score distribution:")
        print(df['score'].describe())
        
        # Detect grading system by analyzing the score range
        score_min = df['score'].min()
        score_max = df['score'].max()
        
        print(f"Detected score range: {score_min} to {score_max}")
        
        # If scores are likely percentages (>10), convert them to the 1.0-5.0 scale
        # This handles cases where the database might store percentages instead of the Philippine scale
        is_percentage_scale = score_max > 10
        if is_percentage_scale:
            print("Detected percentage-based scores, converting to 1.0-5.0 scale")
            # Convert percentage (higher is better) to Philippine scale (lower is better)
            # Formula: 1.0 + 4.0 * (100 - score) / 100
            # E.g., 95% becomes 1.2, 75% becomes 2.0, 50% becomes 3.0
            df['original_score'] = df['score']
            df['score'] = 1.0 + 4.0 * (100 - df['score']) / 100
            df['score'] = df['score'].clip(1.0, 5.0)  # Ensure within 1.0-5.0 range
            
            print("After percentage conversion:")
            print(df[['original_score', 'score']].head())
            print("New score range:", df['score'].min(), df['score'].max())
        
        # Drop rows with NaN scores
        df = df.dropna(subset=['score'])

        if df.empty:
            return jsonify({"error": "No valid grades found after validation"}), 400

        # Print the first few rows to debug
        print("First few rows of input data:")
        print(df.head().to_string())
        print("Column names:", df.columns.tolist())

        # Step 2: Process Data (Group by Semester & Year)
        results = []
        
        # Make sure required columns exist, use fallbacks if not
        if 'first_name' not in df.columns:
            df['first_name'] = 'Student'
        if 'last_name' not in df.columns:
            df['last_name'] = ''
        if 'course' not in df.columns:
            df['course'] = 'Unknown'
            
        # Calculate average score per student
        student_avg = df.groupby(["student_number", "first_name", "last_name", "semester", "year"])["score"].mean().reset_index()
        student_avg.rename(columns={"score": "average_score"}, inplace=True)
        
        # Print average scores
        print("Average scores distribution:")
        print(student_avg['average_score'].describe())
        
        # Add the course back to student_avg
        if 'course' in df.columns:
            # Get the course for each student (using first occurrence)
            course_df = df.drop_duplicates('student_number')[['student_number', 'course']]
            student_avg = student_avg.merge(course_df, on='student_number', how='left')
        else:
            student_avg['course'] = 'Unknown'
            
        # For each semester-year combination
        for (semester, year), group in student_avg.groupby(["semester", "year"]):
            # Use only numeric features for clustering
            features_df = group[["average_score"]].copy()
            
            # If we have only one or no students, skip clustering for this semester-year
            if len(features_df) <= 1:
                continue
                
            # IMPORTANT: For Philippine grading system (1.0 is excellent, 5.0 is fail)
            # We need to invert the scores for clustering since lower is better
            features_df["inverted_score"] = 6.0 - features_df["average_score"]
                
            # Normalize scores (Min-Max Scaling 0-1)
            # Handle case where all scores might be the same
            if features_df["inverted_score"].max() == features_df["inverted_score"].min():
                features_df["inverted_score_norm"] = 0.5  # Set all to middle value
            else:
                features_df["inverted_score_norm"] = (features_df["inverted_score"] - features_df["inverted_score"].min()) / (features_df["inverted_score"].max() - features_df["inverted_score"].min())
            
            # Determine number of clusters (use 3 if we have enough students, otherwise use fewer)
            n_clusters = min(3, len(features_df))
            
            # Apply K-Means Clustering
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            group['cluster'] = kmeans.fit_predict(features_df[["inverted_score_norm"]])
            
            # Get cluster centroids and determine which is High/Medium/Low
            centroids = kmeans.cluster_centers_
            centroid_values = [c[0] for c in centroids]  # Extract the values
            
            # Create mapping from cluster number to letter grade
            cluster_map = {}
            sorted_indices = np.argsort(centroid_values)
            
            # In Philippine system: lower values (1.0) are better
            # We're working with inverted scores, so higher inverted values = better original scores
            # If we have 3 clusters, assign A, B, C
            if n_clusters == 3:
                cluster_map[sorted_indices[2]] = 'A'  # Highest inverted value = lowest original = best grades
                cluster_map[sorted_indices[1]] = 'B'  # Middle
                cluster_map[sorted_indices[0]] = 'C'  # Lowest inverted value = highest original = worst grades
            # If we have 2 clusters, assign A, C 
            elif n_clusters == 2:
                cluster_map[sorted_indices[1]] = 'A'  # Better grades
                cluster_map[sorted_indices[0]] = 'C'  # Worse grades
            # If only 1 cluster, assign B (middle)
            else:
                cluster_map[0] = 'B'
            
            # Map cluster number to letter grade
            group['cluster'] = group['cluster'].map(cluster_map)
            
            # Debug output for clusters
            print(f"Clustering results for {semester} {year}:")
            for cluster_letter in ['A', 'B', 'C']:
                cluster_group = group[group['cluster'] == cluster_letter]
                if not cluster_group.empty:
                    print(f"Cluster {cluster_letter}: {len(cluster_group)} students")
                    print(f"  Average scores: {cluster_group['average_score'].mean():.2f}")
                    print(f"  Score range: {cluster_group['average_score'].min():.2f} - {cluster_group['average_score'].max():.2f}")
            
            # Prepare results for each student
            for _, student in group.iterrows():
                cluster = student['cluster']
                
                # Calculate if the student is at risk based on Philippine grading
                # In Philippine system: Students with grades > 3.0 are considered failing
                is_at_risk = student["average_score"] > 3.0
                
                student_info = {
                    "student_number": student["student_number"],
                    "first_name": student["first_name"],
                    "last_name": student["last_name"],
                    "semester": semester,
                    "year": year,
                    "course": student.get("course", "Unknown"),
                    "average_score": round(student["average_score"], 2),
                    "cluster": cluster,
                    "is_at_risk": is_at_risk or cluster == 'C'  # Either failing or in lowest cluster
                }
                
                # Add recommendation for at-risk students
                if student_info["is_at_risk"]:
                    # Get the specific subjects where the student scored the highest (worst in Philippine system)
                    student_grades = df[df['student_number'] == student["student_number"]]
                    if not student_grades.empty:
                        try:
                            # In Philippine system, higher score is worse
                            worst_subject = student_grades.loc[student_grades['score'].idxmax()]
                            
                            # Different recommendations based on how far they are from passing
                            if student["average_score"] > 4.0:
                                action = "Immediate academic intervention"
                            elif student["average_score"] > 3.5:
                                action = "Tutoring sessions"
                            else:
                                action = "Study group participation"
                                
                            student_info["recommendation"] = {
                                "recommended_action": action,
                                "focus_area": f"Improve {worst_subject.get('subject_name', 'problematic subjects')}",
                                "reason": f"Grade of {worst_subject.get('score', student['average_score']):.2f} (needs {3.0 if worst_subject.get('score', 0) > 3.0 else 'improvement'} to pass)"
                            }
                        except Exception as e:
                            print(f"Error generating recommendation: {e}")
                            student_info["recommendation"] = {
                                "recommended_action": "Academic counseling",
                                "focus_area": "Overall academic improvement",
                                "reason": f"Average grade of {student['average_score']:.1f} needs improvement"
                            }
                    else:
                        student_info["recommendation"] = {
                            "recommended_action": "Academic counseling",
                            "focus_area": "Overall academic improvement",
                            "reason": f"Average grade of {student['average_score']:.1f} needs improvement"
                        }
                
                results.append(student_info)

        return jsonify(results)

    except Exception as e:
        print("Exception in cluster_students:", str(e))
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
