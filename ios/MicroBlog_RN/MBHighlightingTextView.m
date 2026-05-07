//
//  MBHighlightingTextView.m
//  MicroBlog_RN
//
//  Created by Manton Reece on 4/16/23.
//

#import "MBHighlightingTextView.h"

#import <React/UIView+React.h>

@interface MBHighlightingTextView ()

@property (assign, nonatomic) BOOL did_setup_keyboard_notifications;
@property (assign, nonatomic) UIEdgeInsets base_content_inset;
@property (assign, nonatomic) UIEdgeInsets base_scroll_indicator_inset;
@property (assign, nonatomic) CGFloat keyboard_overlap_height;

@end

@implementation MBHighlightingTextView

- (void) setColorScheme:(NSString *)colorScheme
{
  if ((_colorScheme == nil && colorScheme == nil) || [_colorScheme isEqualToString:colorScheme]) {
    return;
  }

  _colorScheme = [colorScheme copy];
  [self applyTheme];
}

- (void) dealloc
{
  if (self.did_setup_keyboard_notifications) {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
  }
}

- (void) setupKeyboardNotificationsIfNeeded
{
  if (self.did_setup_keyboard_notifications) {
    return;
  }

  self.base_content_inset = self.contentInset;
  self.base_scroll_indicator_inset = self.scrollIndicatorInsets;

  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillChangeFrameNotification:) name:UIKeyboardWillChangeFrameNotification object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillHideNotification:) name:UIKeyboardWillHideNotification object:nil];

  self.did_setup_keyboard_notifications = YES;
}

- (void) applyBottomInset:(CGFloat)bottom_inset duration:(NSTimeInterval)duration curve:(UIViewAnimationCurve)curve scrollCaretToSelection:(BOOL)scroll_caret_to_selection
{
  UIEdgeInsets content_inset = self.base_content_inset;
  content_inset.bottom += bottom_inset;

  UIEdgeInsets indicator_inset = self.base_scroll_indicator_inset;
  indicator_inset.bottom += bottom_inset;

  UIViewAnimationOptions options = ((NSUInteger) curve << 16) | UIViewAnimationOptionBeginFromCurrentState;
  [UIView animateWithDuration:duration delay:0 options:options animations:^{
    self.contentInset = content_inset;
    self.scrollIndicatorInsets = indicator_inset;
  } completion:nil];

  if (scroll_caret_to_selection && self.selectedTextRange != nil) {
    CGRect caret_rect = [self caretRectForPosition:self.selectedTextRange.end];
    [self scrollRectToVisible:CGRectInset(caret_rect, 0, -8) animated:NO];
  }
}

- (void) updateInsetsWithDuration:(NSTimeInterval)duration curve:(UIViewAnimationCurve)curve scrollCaretToSelection:(BOOL)scroll_caret_to_selection
{
  CGFloat bottom_inset = self.keyboard_overlap_height + self.bottom_overlay_height;
  [self applyBottomInset:bottom_inset duration:duration curve:curve scrollCaretToSelection:scroll_caret_to_selection];
}

- (void) refreshInsets
{
  [self updateInsetsWithDuration:0 curve:UIViewAnimationCurveEaseInOut scrollCaretToSelection:NO];
}

- (BOOL) isIpad
{
  return (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad);
}

- (BOOL) isIpadPortrait
{
  BOOL is_ipad = (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad);
  BOOL is_portrait = (UIDevice.currentDevice.orientation == UIDeviceOrientationPortrait) || (UIDevice.currentDevice.orientation == UIDeviceOrientationPortraitUpsideDown);

  return (is_ipad && is_portrait);
}

- (void) didMoveToWindow
{
  [super didMoveToWindow];

  [self setupKeyboardNotificationsIfNeeded];
  [self applyTheme];
}

- (void) traitCollectionDidChange:(UITraitCollection *)previousTraitCollection
{
  [super traitCollectionDidChange:previousTraitCollection];

  if (previousTraitCollection.userInterfaceStyle != self.traitCollection.userInterfaceStyle) {
    [self applyTheme];
  }
}

- (void) layoutSubviews
{
  [super layoutSubviews];

  [self updateInsetsWithDuration:0 curve:UIViewAnimationCurveEaseInOut scrollCaretToSelection:NO];
}

- (void) callTextChanged:(NSString *)text
{
  if (self.onChangeText) {
    self.onChangeText(@{ @"text": text });
  }
}

- (void) callSelectionChanged:(UITextRange *)range
{
  if (self.onSelectionChange) {
    NSInteger start = [self offsetFromPosition:self.beginningOfDocument toPosition:range.start];
    NSInteger end = [self offsetFromPosition:self.beginningOfDocument toPosition:range.end];

    self.onSelectionChange(@{
      @"selection": @{
        @"start": @(start),
        @"end": @(end)
      }
    });
  }
}

- (BOOL) hasExplicitColorScheme
{
  return [self.colorScheme isEqualToString:@"dark"] || [self.colorScheme isEqualToString:@"light"];
}

- (UIUserInterfaceStyle) resolvedInterfaceStyle
{
  if ([self.colorScheme isEqualToString:@"dark"]) {
    return UIUserInterfaceStyleDark;
  }

  if ([self.colorScheme isEqualToString:@"light"]) {
    return UIUserInterfaceStyleLight;
  }

  UIUserInterfaceStyle style = self.traitCollection.userInterfaceStyle;
  if (style == UIUserInterfaceStyleUnspecified) {
    style = UIScreen.mainScreen.traitCollection.userInterfaceStyle;
  }

  return style == UIUserInterfaceStyleDark ? UIUserInterfaceStyleDark : UIUserInterfaceStyleLight;
}

- (UIColor *) themeBackgroundColor
{
  if ([self resolvedInterfaceStyle] == UIUserInterfaceStyleDark) {
    return [UIColor colorWithRed:31.0 / 255.0 green:41.0 / 255.0 blue:55.0 / 255.0 alpha:1.0];
  }

  return [UIColor whiteColor];
}

- (UIColor *) themeTextColor
{
  if ([self resolvedInterfaceStyle] == UIUserInterfaceStyleDark) {
    return [UIColor whiteColor];
  }

  return [UIColor blackColor];
}

- (void) applyTheme
{
  UIUserInterfaceStyle style = [self resolvedInterfaceStyle];
  UIColor* text_color = [self themeTextColor];

  self.overrideUserInterfaceStyle = [self hasExplicitColorScheme] ? style : UIUserInterfaceStyleUnspecified;
  self.backgroundColor = [self themeBackgroundColor];
  self.textColor = text_color;
  self.keyboardAppearance = style == UIUserInterfaceStyleDark ? UIKeyboardAppearanceDark : UIKeyboardAppearanceDefault;

  NSMutableDictionary* typing_attributes = [self.typingAttributes mutableCopy] ?: [NSMutableDictionary dictionary];
  typing_attributes[NSForegroundColorAttributeName] = text_color;
  if (self.font != nil) {
    typing_attributes[NSFontAttributeName] = self.font;
  }
  self.typingAttributes = typing_attributes;

  if (self.textStorage.length > 0) {
    [self.layoutManager invalidateDisplayForCharacterRange:NSMakeRange(0, self.textStorage.length)];
  }
  [self setNeedsDisplay];
}

#pragma mark -

- (void) keyboardWillChangeFrameNotification:(NSNotification*)notification
{
  NSDictionary* info = [notification userInfo];
  CGRect kb_r = [[info objectForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue];
  CGRect kb_in_view_r = [self convertRect:kb_r fromView:nil];
  CGRect intersection = CGRectIntersection(self.bounds, kb_in_view_r);

  CGFloat covered_height = CGRectIsNull(intersection) ? 0.0 : intersection.size.height;
  if (covered_height > 0 && self.inputAccessoryView != nil && self.bottom_overlay_height <= 0) {
    covered_height += self.inputAccessoryView.bounds.size.height;
  }

  self.keyboard_overlap_height = covered_height;
  NSTimeInterval duration = [[info objectForKey:UIKeyboardAnimationDurationUserInfoKey] doubleValue];
  UIViewAnimationCurve curve = (UIViewAnimationCurve) [[info objectForKey:UIKeyboardAnimationCurveUserInfoKey] integerValue];
  [self updateInsetsWithDuration:duration curve:curve scrollCaretToSelection:YES];
}

- (void) keyboardWillHideNotification:(NSNotification*)notification
{
  NSDictionary* info = [notification userInfo];
  self.keyboard_overlap_height = 0;
  NSTimeInterval duration = [[info objectForKey:UIKeyboardAnimationDurationUserInfoKey] doubleValue];
  UIViewAnimationCurve curve = (UIViewAnimationCurve) [[info objectForKey:UIKeyboardAnimationCurveUserInfoKey] integerValue];
  [self updateInsetsWithDuration:duration curve:curve scrollCaretToSelection:NO];
}

@end
