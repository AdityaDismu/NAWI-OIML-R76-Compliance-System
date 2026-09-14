from fastapi import Header, HTTPException


async def get_current_user_id(
    authorization: str | None = Header(default=None),
) -> str:
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization required",
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header",
        )

    return authorization.replace("Bearer ", "", 1)