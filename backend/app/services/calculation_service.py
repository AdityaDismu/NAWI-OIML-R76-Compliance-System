from app.core.database import supabase


def save_calculation(
    test_instance_id,
    calculation_type,
    inputs,
    outputs,
):
    response = (
        supabase.table("calculations")
        .insert(
            {
                "test_instance_id": test_instance_id,
                "calculation_type": calculation_type,
                "inputs": inputs,
                "outputs": outputs,
            }
        )
        .execute()
    )

    return response.data


def save_test_result(
    test_instance_id,
    result,
    criterion,
    explanation,
    details=None,
):
    response = (
        supabase.table("test_results")
        .insert(
            {
                "test_instance_id": test_instance_id,
                "result": result,
                "criterion": criterion,
                "explanation": explanation,
                "details": details or {},
            }
        )
        .execute()
    )

    return response.data