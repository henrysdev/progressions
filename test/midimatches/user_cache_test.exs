defmodule Midimatches.UserCacheTest do
  use ExUnit.Case

  alias Midimatches.{
    Types.User,
    UserCache
  }

  defp flush_ets_table() do
    if :ets.whereis(:user_cache) != :undefined do
      :ets.match_delete(:user_cache, {:"$1", :"$2"})
    else
      :ok
    end
  end

  setup do
    on_exit(fn -> flush_ets_table() end)
    :ok
  end

  test "init cache creates user cache ets table" do
    cache_exists? = :ets.whereis(:user_cache) != :undefined
    assert cache_exists?
  end

  describe "upsert user" do
    test "for a new user to the user cache" do
      user_id = "abc123"

      user = %User{
        user_id: user_id,
        user_alias: "foobarzoo"
      }

      UserCache.upsert_user(user)
      assert :ets.lookup(:user_cache, user_id) == [{user_id, user}]
    end

    test "for an existing user to the user cache" do
      user_id = "abc123"

      orig_user = %User{
        user_id: user_id,
        user_alias: "foobarzoo"
      }

      updated_user = %User{
        user_id: user_id,
        user_alias: "barzeeedo"
      }

      UserCache.upsert_user(orig_user)
      assert :ets.lookup(:user_cache, user_id) == [{user_id, orig_user}]

      UserCache.upsert_user(updated_user)
      assert :ets.lookup(:user_cache, user_id) == [{user_id, updated_user}]
    end
  end

  describe "get a user" do
    test "that exists in the user cache" do
      user_id = "abc123"

      user = %User{
        user_id: user_id,
        user_alias: "foobarzoo"
      }

      found_user_before = UserCache.get_user("abc123")
      assert(is_nil(found_user_before))
      UserCache.upsert_user(user)

      found_user_after = UserCache.get_user("abc123")
      assert(!is_nil(found_user_after))
    end

    test "that does not exist in the user cache" do
      assert(is_nil(UserCache.get_user("abc123")))
    end
  end

  test "delete a user from the user cache" do
    user_id = "abc123"

    user = %User{
      user_id: user_id,
      user_alias: "foobarzoo"
    }

    UserCache.upsert_user(user)

    found_user_before = UserCache.get_user("abc123")
    assert(!is_nil(found_user_before))

    UserCache.delete_user(user_id)

    found_user_after = UserCache.get_user("abc123")
    assert(is_nil(found_user_after))
  end
end
