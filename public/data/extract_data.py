import json
from collections import defaultdict



# 입력 GeoJSON 파일 경로
input_file = "data.geojson"

# 파일 읽기
with open(input_file, "r", encoding="utf-8") as f:
    geojson_data = json.load(f)

# "MNTN_NM" 값을 기준으로 features를 그룹화
grouped = defaultdict(list)
for feature in geojson_data["features"]:
    mntn_nm = feature["properties"].get("MNTN_NM", "unknown")
    grouped[mntn_nm].append(feature)

# 그룹별로 새로운 GeoJSON 파일로 저장
for mntn_nm, features in grouped.items():
    output_data = {
        "type": "FeatureCollection",
        "name": mntn_nm,
        "crs": geojson_data.get("crs", {}),
        "features": features
    }
    # 파일 이름은 mntn_nm 값에 기반하여 생성 (특수문자 등에 주의)
    output_file = f"{mntn_nm}.geojson"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    print(f"저장 완료: {output_file}")
