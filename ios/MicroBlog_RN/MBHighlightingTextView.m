//
//  MBHighlightingTextView.m
//  MicroBlog_RN
//
//  Created by Manton Reece on 4/16/23.
//

#import "MBHighlightingTextView.h"

#import <React/UIView+React.h>

@implementation MBHighlightingTextView

- (id) init
{
  self = [super init];
  if (self) {
  }

  return self;
}

- (void) finishSetup
{
  if (self.inputAccessoryView == nil) {
    [self becomeFirstResponder];
    self.inputAccessoryView = [self.reactAccessoryView inputAccessoryView];
    [self reloadInputViews];
  }
}

- (void) didSetProps:(NSArray<NSString *> *)changedProps
{
  NSLog(@"didSetProps %@", changedProps);
}

- (UIView *) findRootView
{
  UIView* root = self;
  while ([root superview] != nil) {
      root = [root superview];
  }
  
  return root;
}

- (UIView *) findAccessoryViewFromView:(UIView *)view withNativeID:(NSString *)nativeID
{
  UIView* found_view = nil;

  // is this the view?
  if ([[view nativeID] isEqualToString:nativeID]) {
    return view;
  }

  // look at subviews and call recursively
  NSArray* subs = view.subviews;
  for (UIView* sub in subs) {
    found_view = [self findAccessoryViewFromView:sub withNativeID:nativeID];
    if (found_view) {
      break;
    }
  }
  
  return found_view;
}

- (void) didMoveToSuperview
{
  [super didMoveToSuperview];
  
  if (self.superview != nil) {
    UIView* root = [self findRootView];
    UIView* v = [self findAccessoryViewFromView:root withNativeID:@"input_toolbar"];
    if (v) {
      NSLog(@"found accessory view");
      self.reactAccessoryView = v;
      
      [self performSelector:@selector(finishSetup) withObject:nil afterDelay:0.5];
    }
  }
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

@end
