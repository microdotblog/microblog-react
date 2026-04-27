//
//  MBLiquidGlassButton.m
//  MicroBlog_RN
//

#import "MBLiquidGlassButton.h"

@interface MBLiquidGlassButton ()

@property (strong, nonatomic) UIButton* button;

@end

@implementation MBLiquidGlassButton

- (instancetype) initWithFrame:(CGRect)frame
{
  self = [super initWithFrame:frame];
  if (self) {
    self.backgroundColor = UIColor.clearColor;
    self.button = [UIButton buttonWithType:UIButtonTypeSystem];
    self.button.frame = self.bounds;
    self.button.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self.button addTarget:self action:@selector(handlePress) forControlEvents:UIControlEventTouchUpInside];
    [self addSubview:self.button];
    [self applyConfiguration];
  }

  return self;
}

- (void) setTitle:(NSString *)title
{
  if ((_title == nil && title == nil) || [_title isEqualToString:title]) {
    return;
  }

  _title = [title copy];
  [self applyConfiguration];
}

- (void) setSystemImageName:(NSString *)systemImageName
{
  if ((_systemImageName == nil && systemImageName == nil) || [_systemImageName isEqualToString:systemImageName]) {
    return;
  }

  _systemImageName = [systemImageName copy];
  [self applyConfiguration];
}

- (void) setVariant:(NSString *)variant
{
  if ((_variant == nil && variant == nil) || [_variant isEqualToString:variant]) {
    return;
  }

  _variant = [variant copy];
  [self applyConfiguration];
}

- (void) setButtonAccessibilityLabel:(NSString *)buttonAccessibilityLabel
{
  _buttonAccessibilityLabel = [buttonAccessibilityLabel copy];
  self.button.accessibilityLabel = buttonAccessibilityLabel;
}

- (void) setForegroundColor:(UIColor *)foregroundColor
{
  _foregroundColor = foregroundColor;
  [self applyConfiguration];
}

- (void) setBaseBackgroundColor:(UIColor *)baseBackgroundColor
{
  _baseBackgroundColor = baseBackgroundColor;
  [self applyConfiguration];
}

- (UIButtonConfiguration *) buttonConfiguration
{
#if defined(__IPHONE_26_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_26_0
  if (@available(iOS 26.0, *)) {
    if ([self.variant isEqualToString:@"prominent"]) {
      return [UIButtonConfiguration prominentGlassButtonConfiguration];
    }

    if ([self.variant isEqualToString:@"clear"]) {
      return [UIButtonConfiguration clearGlassButtonConfiguration];
    }

    if ([self.variant isEqualToString:@"prominentClear"]) {
      return [UIButtonConfiguration prominentClearGlassButtonConfiguration];
    }

    return [UIButtonConfiguration glassButtonConfiguration];
  }
#endif

  return [UIButtonConfiguration borderedButtonConfiguration];
}

- (void) applyConfiguration
{
  UIButtonConfiguration* configuration = [self buttonConfiguration];
  configuration.title = self.title;
  configuration.baseForegroundColor = self.foregroundColor;
  configuration.baseBackgroundColor = self.baseBackgroundColor;
  configuration.cornerStyle = UIButtonConfigurationCornerStyleCapsule;
  configuration.buttonSize = UIButtonConfigurationSizeMedium;

  if (self.systemImageName.length > 0) {
    UIImageSymbolConfiguration* symbol_config = [UIImageSymbolConfiguration configurationWithPointSize:17 weight:UIImageSymbolWeightSemibold];
    configuration.image = [UIImage systemImageNamed:self.systemImageName withConfiguration:symbol_config];
    configuration.preferredSymbolConfigurationForImage = symbol_config;
    configuration.contentInsets = NSDirectionalEdgeInsetsMake(0, 0, 0, 0);
  }
  else {
    configuration.contentInsets = NSDirectionalEdgeInsetsMake(7, 14, 7, 14);
  }

  self.button.configuration = configuration;
  self.button.accessibilityLabel = self.buttonAccessibilityLabel;
}

- (void) handlePress
{
  if (self.onPress) {
    self.onPress(@{});
  }
}

@end
