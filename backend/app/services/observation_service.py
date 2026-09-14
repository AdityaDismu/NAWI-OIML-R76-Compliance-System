from app.core.database import supabase


def save_observations(
    test_instance_id,
    observations,
):
    rows = []

    for index, observation in enumerate(
        observations,
        start=1,
    ):
        rows.append(
            {
                "test_instance_id": test_instance_id,
                "sequence_no": index,
                "load_value": observation.get(
                    "load_value"
                ),
                "indication_value": observation.get(
                    "indication_value"
                ),
                "delta_load": observation.get(
                    "delta_load",
                    0,
                ),
                "direction": observation.get(
                    "direction"
                ),
                "metadata": observation.get(
                    "metadata",
                    {},
                ),
            }
        )

    if not rows:
        return []

    response = (
        supabase.table("observations")
        .insert(rows)
        .execute()
    )

    return response.data