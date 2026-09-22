"""
Configuration thresholds for computer vision analysis.
Named constants as required by Phase 5 spec.
"""

# Confidence threshold for face presence
FACE_DETECTION_CONFIDENCE = 0.5

# Object detection confidence threshold for mobile phones & prohibited devices
# Set to 0.60 to eliminate false positives from hands, cups, watches, and desk clutter
PHONE_DETECTION_CONFIDENCE = 0.60

# Head pose angle thresholds (in degrees)
# Looking left/right yaw threshold (moderate turn away from screen)
YAW_LOOK_AWAY_DEG = 20.0
# Distinct head turn threshold
YAW_HEAD_TURNED_DEG = 30.0

# Pitch looking down/up thresholds (in degrees)
# Looking up towards ceiling: 16.0 degrees (looking at webcam/top of screen is ~0-8 deg, perfectly normal)
# Looking down at lap/notes/phone: 15.0 degrees
PITCH_LOOK_UP_DEG = 16.0
PITCH_LOOK_DOWN_DEG = 15.0

# Iris gaze displacement ratio thresholds (relative to eye corners)
# Center gaze spans 0.28 to 0.72 horizontally
IRIS_HORIZONTAL_RIGHT_RATIO = 0.28
IRIS_HORIZONTAL_LEFT_RATIO = 0.72

# Vertical iris gaze ratios (y increases downwards in image coordinates)
# Normal resting pupil center is ~0.35 - 0.42 relative to upper eyelid
# > 0.65 means iris is rolled downwards towards lower eyelid (looking down)
# < 0.25 means iris is rolled upwards towards upper eyelid (looking up at ceiling)
IRIS_VERTICAL_DOWN_RATIO = 0.65
IRIS_VERTICAL_UP_RATIO = 0.25

