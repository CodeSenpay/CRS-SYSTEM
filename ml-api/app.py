from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from flask_cors import CORS
import traceback
import json

# Create custom JSON encoder to handle NumPy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, np.bool_):
            return bool(obj)
        return super(NumpyEncoder, self).default(obj)

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests
app.json_encoder = NumpyEncoder  # Use custom JSON encoder

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "Student Clustering ML API is running",
        "version": "1.0.0"
    })

# Helper function to convert NumPy types to native Python types
def convert_numpy_types(obj):
    if isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.bool_):
        return bool(obj)
    else:
        return obj

@app.route('/api/cluster-students', methods=['POST'])
def cluster_students():
    try:
        # Get the request data
        data = request.json
        if not data or 'grades' not in data:
            return jsonify({'error': 'No grades data provided'}), 400

        grades_data = data['grades']
        if not grades_data:
            return jsonify([]), 200  # Return empty array if no data

        print(f"Received {len(grades_data)} grade records for clustering")
        if grades_data and len(grades_data) > 0:
            print("Sample record:", json.dumps(grades_data[0], indent=2))
            print("All subject_type values:")
            for grade in grades_data:
                print(f"  - {grade.get('subject_type', 'None')}")
        
        # Convert to DataFrame for processing
        df = pd.DataFrame(grades_data)
        
        # Print column names and data types for debugging
        print("Available columns:", df.columns.tolist())
        print("Data types:", df.dtypes)
        
        # Print each unique subject_type value
        if 'subject_type' in df.columns:
            unique_types = df['subject_type'].unique()
            print(f"Unique subject_type values ({len(unique_types)}):", unique_types)
        else:
            print("WARNING: No subject_type column found in the data")
            df['subject_type'] = 'Unknown'
        
        # Make sure numeric fields are numeric
        df['score'] = pd.to_numeric(df['score'], errors='coerce')
        print("Score range:", df['score'].min(), "to", df['score'].max())
        
        # Group by student
        student_ids = df['student_id'].unique()
        print(f"Found {len(student_ids)} unique students")
        
        # Process each student
        results = []
        for student_id in student_ids:
            try:
                # Get student info from first grade record
                student_grades = df[df['student_id'] == student_id]
                if student_grades.empty:
                    continue
                
                student_record = student_grades.iloc[0]
                
                # Get basic info
                first_name = student_record.get('first_name', 'Unknown')
                last_name = student_record.get('last_name', 'Unknown')
                year_level = student_record.get('year_level', 'Unknown')
                semester = student_record.get('semester', 'Unknown')
                school_year = student_record.get('school_year', 'Unknown')
                student_number = student_record.get('student_number', student_id)
                
                # Calculate overall average
                average_score = student_grades['score'].mean()
                
                # Handle different possible subject type values
                print(f"Subject types for student {student_id}:", student_grades['subject_type'].unique())
                
                # For Major subjects (case insensitive)
                major_pattern = '(?i)maj'  # Case insensitive regex pattern to match any variant of "maj"
                major_grades = student_grades[student_grades['subject_type'].str.contains(major_pattern, regex=True, na=False)]
                major_avg = major_grades['score'].mean() if not major_grades.empty else None
                print(f"Student {student_id} major subjects: {len(major_grades)}, avg: {major_avg}")
                
                # For Minor subjects (case insensitive)
                minor_pattern = '(?i)min'  # Case insensitive regex pattern to match any variant of "min"
                minor_grades = student_grades[student_grades['subject_type'].str.contains(minor_pattern, regex=True, na=False)]
                minor_avg = minor_grades['score'].mean() if not minor_grades.empty else None
                print(f"Student {student_id} minor subjects: {len(minor_grades)}, avg: {minor_avg}")
                
                # Risk assessment
                is_at_risk = average_score > 3.0
                major_risk = major_avg > 2.5 if major_avg is not None else False
                minor_risk = minor_avg > 3.0 if minor_avg is not None else None
                
                # Create student info for clustering results
                student_info = {
                    'student_id': student_id,
                    'student_number': student_number,
                    'first_name': first_name,
                    'last_name': last_name,
                    'year_level': year_level,
                    'semester': semester,
                    'school_year': school_year,
                    'average_score': float(average_score) if not pd.isna(average_score) else 0.0,
                    'is_at_risk': bool(is_at_risk),
                    'major_grade': float(major_avg) if major_avg is not None and not pd.isna(major_avg) else None,
                    'minor_grade': float(minor_avg) if minor_avg is not None and not pd.isna(minor_avg) else None,
                    'has_major_risk': bool(major_risk),
                    'has_minor_risk': bool(minor_risk) if minor_risk is not None else False,
                    'major_cluster': 'High' if major_avg is not None and major_avg <= 1.7 else 
                                   'Medium' if major_avg is not None and major_avg <= 2.5 else 
                                   'Low' if major_avg is not None and major_avg > 2.5 else 'Unknown',
                    'minor_cluster': 'High' if minor_avg is not None and minor_avg <= 1.7 else 
                                   'Medium' if minor_avg is not None and minor_avg <= 3.0 else 
                                   'Low' if minor_avg is not None and minor_avg > 3.0 else 'Unknown',
                }
                
                # Add recommendations for at-risk students
                if is_at_risk or major_risk or (minor_risk == True):
                    # Get all failed subjects, categorized by type
                    failed_major_subjects = student_grades[
                        (student_grades['subject_type'].str.contains(major_pattern, regex=True, na=False)) & 
                        (student_grades['score'] > 2.5)
                    ]
                    
                    failed_minor_subjects = student_grades[
                        (student_grades['subject_type'].str.contains(minor_pattern, regex=True, na=False)) & 
                        (student_grades['score'] > 3.0)
                    ]
                    
                    recommendations = []
                    
                    # Process failed major subjects
                    if not failed_major_subjects.empty:
                        # Sort by score (worst first)
                        failed_major_subjects = failed_major_subjects.sort_values('score', ascending=False)
                        major_rec = {
                            "subject_type": "Major",
                            "focus_area": "Major Subject Improvement"
                        }
                        
                        # Generate recommendation based on worst major subject
                        worst_major = failed_major_subjects.iloc[0]
                        score = float(worst_major['score'])
                        if score > 4.0:
                            action = "Immediate academic intervention"
                        elif score > 3.5:
                            action = "Regular tutoring sessions"
                        else:
                            action = "Additional study time"
                        
                        major_rec["recommended_action"] = action
                        
                        # List all failed major subjects
                        failed_major_list = []
                        for _, subj in failed_major_subjects.iterrows():
                            failed_major_list.append(f"{subj['subject_name']}: {subj['score']}")
                        
                        major_rec["reason"] = f"Student has failed {len(failed_major_list)} major subject(s) with grades above 2.5.\nFailed subjects: {', '.join(failed_major_list)}"
                        recommendations.append(major_rec)
                    
                    # Process failed minor subjects
                    if not failed_minor_subjects.empty:
                        # Sort by score (worst first)
                        failed_minor_subjects = failed_minor_subjects.sort_values('score', ascending=False)
                        minor_rec = {
                            "subject_type": "Minor",
                            "focus_area": "Minor Subject Improvement"
                        }
                        
                        # Generate recommendation based on worst minor subject
                        worst_minor = failed_minor_subjects.iloc[0]
                        score = float(worst_minor['score'])
                        if score > 4.0:
                            action = "Immediate academic intervention"
                        elif score > 3.5:
                            action = "Regular tutoring sessions"
                        else:
                            action = "Additional study time"
                        
                        minor_rec["recommended_action"] = action
                        
                        # List all failed minor subjects
                        failed_minor_list = []
                        for _, subj in failed_minor_subjects.iterrows():
                            failed_minor_list.append(f"{subj['subject_name']}: {subj['score']}")
                        
                        minor_rec["reason"] = f"Student has failed {len(failed_minor_list)} minor subject(s) with grades above 3.0.\nFailed subjects: {', '.join(failed_minor_list)}"
                        recommendations.append(minor_rec)
                    
                    # Add recommendations to student info
                    if recommendations:
                        student_info['recommendations'] = recommendations
                
                results.append(student_info)
            except Exception as student_error:
                print(f"Error processing student {student_id}: {str(student_error)}")
                traceback.print_exc()
                continue

        print(f"Successfully processed {len(results)} students")
        return jsonify(results)

    except Exception as e:
        print(f"Error in cluster_students: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
