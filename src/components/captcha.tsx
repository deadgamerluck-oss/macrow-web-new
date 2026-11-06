import { useEffect, useState } from "react";
import { fieldClass } from "@/components/site";

/**
 * Lightweight anti-spam check: a simple arithmetic question.
 * Blocks bots that don't run JavaScript; combined with server-side rate limits.
 */
export function MathCaptcha({ id, onValid }: { id: string; onValid: (valid: boolean) => void }) {
  const [pair, setPair] = useState<[number, number]>([0, 0]);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setPair([2 + Math.floor(Math.random() * 7), 1 + Math.floor(Math.random() * 8)]);
  }, []);

  useEffect(() => {
    onValid(answer.trim() !== "" && Number(answer) === pair[0] + pair[1]);
  }, [answer, pair, onValid]);

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        Quick check: what is {pair[0]} + {pair[1]}?
      </label>
      <input
        id={id}
        name="captcha"
        className={fieldClass}
        inputMode="numeric"
        autoComplete="off"
        required
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Your answer"
      />
    </div>
  );
}
