from flask import Flask, request, jsonify
import mysql.connector
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# MySQL Connection Configuration
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "yourpassword",
    "database": "schoolDB"
}

def get_student_grades():
    """Fetch student grades from MySQL."""
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT student_number, subject_code, score, semester, year FROM Grades")
    grades = cursor.fetchall()
    conn.close()
    return grades

@app.route('/cluster', methods=['POST'])
def cluster_students():
    try:
        # Step 1: Fetch Data from MySQL
        grades = get_student_grades()
        df = pd.DataFrame(grades)

        if df.empty:
            return jsonify({"message": "No grades found"}), 400

        # Step 2: Process Data (Group by Semester & Year)
        results = []
        for (semester, year), group in df.groupby(["semester", "year"]):
            # Pivot subjects as columns (so each student has one row)
            df_pivot = group.pivot(index="student_number", columns="subject_code", values="score").fillna(0)

            # Normalize scores (Min-Max Scaling 0-1)
            df_norm = (df_pivot - df_pivot.min()) / (df_pivot.max() - df_pivot.min())

            # Apply K-Means Clustering (3 Clusters: High, Medium, Low)
            kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
            df_pivot['cluster'] = kmeans.fit_predict(df_norm)

            # Convert Cluster Labels to A (High), B (Medium), C (Low)
            df_pivot['cluster'] = df_pivot['cluster'].map({0: 'A', 1: 'B', 2: 'C'})

            # Step 3: Store Results in MySQL
            conn = mysql.connector.connect(**db_config)
            cursor = conn.cursor()

            for student_number, cluster in df_pivot['cluster'].items():
                cursor.execute("""
                    INSERT INTO ClusteringResults (student_number, cluster, generated_at)
                    VALUES (%s, %s, NOW())
                    ON DUPLICATE KEY UPDATE cluster = VALUES(cluster)
                """, (student_number, cluster))

                # Identify At-Risk Students (Cluster C)
                if cluster == 'C':
                    cursor.execute("""
                        INSERT INTO Recommendations (student_number, recommended_course, reason, is_at_risk, generated_at)
                        VALUES (%s, %s, %s, %s, NOW())
                        ON DUPLICATE KEY UPDATE recommended_course = VALUES(recommended_course), reason = VALUES(reason)
                    """, (student_number, "BSIT - Web Development", "Weak in programming but strong in Web Design", True))

            conn.commit()
            conn.close()

            # Store results for API response
            results.extend([{"student_number": student, "semester": semester, "year": year, "cluster": cluster} for student, cluster in df_pivot['cluster'].items()])

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
