# 🚀 Override System - Quick Reference

## **What It Does**
The override system lets you **instantly replace** any daily puzzle with a test puzzle for immediate feedback, or **queue up multiple puzzles** for sequential testing over several days.

## **⚡ Most Common Commands**

### **Test a Puzzle Right Now**
```sql
INSERT INTO puzzle_overrides (puzzle_date, theme, words, complexity_level, notes) 
VALUES (CURRENT_DATE, 'Your Theme', '[word objects array]'::jsonb, 6, 'Testing Level 6 difficulty')
ON CONFLICT (puzzle_date) DO UPDATE SET theme = EXCLUDED.theme, words = EXCLUDED.words, complexity_level = EXCLUDED.complexity_level, notes = EXCLUDED.notes;
```

### **Queue Multiple Puzzles**
```sql
INSERT INTO puzzle_overrides VALUES 
    (CURRENT_DATE, 'Hurricane Season', '[hurricane words...]'::jsonb, 6, 'Level 6 test A'),
    (CURRENT_DATE + 1, 'Blacksmith Forge', '[blacksmith words...]'::jsonb, 6, 'Level 6 test B'),
    (CURRENT_DATE + 2, 'Space Exploration', '[space words...]'::jsonb, 5, 'Level 5 comparison');
```

### **Check What's Active**
```sql
SELECT puzzle_date, theme, complexity_level, notes FROM puzzle_overrides WHERE puzzle_date >= CURRENT_DATE ORDER BY puzzle_date;
```

### **Remove Override**
```sql
DELETE FROM puzzle_overrides WHERE puzzle_date = CURRENT_DATE;
```

## **🕒 Key Facts**
- **Game resets**: 3:00 AM Eastern Time daily
- **Immediate effect**: Overrides work instantly when added
- **Priority**: Overrides > Daily Puzzles > Hardcoded Fallbacks
- **Testing**: Refresh browser to see new puzzle

## **🔍 Troubleshooting**
1. **Seeing hardcoded puzzle?** → Check browser console for the date it's looking for, ensure override exists for that exact date
2. **JavaScript errors?** → Check browser console for syntax errors
3. **Wrong date?** → Remember 3:00 AM ET reset time - late night = next day

## **✅ Confirmed Working Example**
Hurricane Season Level 6 puzzle successfully overrode daily puzzle on August 1st, 2025 using this exact command:

```sql
INSERT INTO puzzle_overrides (puzzle_date, theme, words, complexity_level, notes) 
VALUES ('2025-08-01', 'Hurricane Season', '[PRESSURE, CYCLONE, EYEWALL, LANDFALL, SURGE words array]'::jsonb, 6, 'Level 6 meteorological test');
```

**For complete documentation**: See `PUZZLE_TESTING_SYSTEM.md`