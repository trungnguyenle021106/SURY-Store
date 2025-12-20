using System.Collections.Concurrent;
using System.ComponentModel;

namespace BuildingBlocks.Core.Extensions
{
    public static class EnumExtensions
    {
        private static readonly ConcurrentDictionary<Enum, string> _cache = new();

        public static string GetDescription(this Enum value)
        {
            if (value == null) return string.Empty;


            return _cache.GetOrAdd(value, (enumValue) =>
            {
                var field = enumValue.GetType().GetField(enumValue.ToString());

                if (field == null) return enumValue.ToString();

                var attribute = Attribute.GetCustomAttribute(field, typeof(DescriptionAttribute))
                                as DescriptionAttribute;

                return attribute != null ? attribute.Description : enumValue.ToString();
            });
        }
    }
}
