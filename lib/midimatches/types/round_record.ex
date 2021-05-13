defmodule Midimatches.Types.RoundRecord do
  @moduledoc false

  alias Midimatches.Types.PlayerOutcome

  use TypedStruct

  @type id() :: String.t()

  typedstruct do
    field(:round_num, integer(), enforce: true)
    # from :round_winners, :players, and :votes
    field(:round_outcomes, list(PlayerOutcome), enforce: true)
    field(:backing_track_id, id(), enforce: true)
  end
end
